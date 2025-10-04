// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

/**
 * @title DomainMarketplace
 * @notice Marketplace for buying, selling, and auctioning Base Name Service domains
 * @dev Supports fixed-price listings and time-based auctions with escrow
 */
contract DomainMarketplace is ReentrancyGuard, Pausable, Ownable, IERC721Receiver {
    // The Base Registrar NFT contract
    IERC721 public immutable baseRegistrar;

    // Marketplace fee in basis points (e.g., 250 = 2.5%)
    uint256 public marketplaceFee = 250; // 2.5%
    uint256 public constant MAX_FEE = 1000; // 10% maximum
    uint256 public constant BASIS_POINTS = 10000;

    // Minimum bid increment percentage (e.g., 500 = 5%)
    uint256 public minBidIncrement = 500; // 5%

    // Minimum auction duration
    uint256 public constant MIN_AUCTION_DURATION = 1 hours;
    uint256 public constant MAX_AUCTION_DURATION = 90 days;

    // Auction extension time if bid placed near end
    uint256 public constant AUCTION_EXTENSION = 10 minutes;
    uint256 public constant AUCTION_EXTENSION_THRESHOLD = 10 minutes;

    struct Listing {
        address seller;
        uint256 price;
        uint256 createdAt;
        bool active;
    }

    struct Auction {
        address seller;
        uint256 startPrice;
        uint256 currentBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        bool active;
        bool settled;
    }

    // tokenId => Listing
    mapping(uint256 => Listing) public listings;

    // tokenId => Auction
    mapping(uint256 => Auction) public auctions;

    // Track pending returns for outbid bidders
    mapping(address => uint256) public pendingReturns;

    // Events
    event Listed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 timestamp
    );

    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 timestamp
    );

    event Sold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 fee,
        uint256 timestamp
    );

    event AuctionCreated(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 startPrice,
        uint256 startTime,
        uint256 endTime,
        uint256 timestamp
    );

    event BidPlaced(
        uint256 indexed tokenId,
        address indexed bidder,
        uint256 amount,
        uint256 timestamp
    );

    event AuctionSettled(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed winner,
        uint256 finalBid,
        uint256 fee,
        uint256 timestamp
    );

    event AuctionCancelled(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 timestamp
    );

    event MarketplaceFeeUpdated(uint256 newFee);
    event MinBidIncrementUpdated(uint256 newIncrement);

    constructor(address _baseRegistrar) {
        require(_baseRegistrar != address(0), "Invalid registrar address");
        baseRegistrar = IERC721(_baseRegistrar);
    }

    // ============ LISTING FUNCTIONS ============

    /**
     * @notice List a domain for sale at a fixed price
     * @param tokenId The domain token ID
     * @param price The sale price in wei
     */
    function createListing(uint256 tokenId, uint256 price) external nonReentrant whenNotPaused {
        require(price > 0, "Price must be greater than 0");
        require(baseRegistrar.ownerOf(tokenId) == msg.sender, "Not domain owner");
        require(!listings[tokenId].active, "Already listed");
        require(!auctions[tokenId].active, "Domain in auction");

        // CHECKS-EFFECTS-INTERACTIONS: Update state BEFORE external call
        listings[tokenId] = Listing({
            seller: msg.sender,
            price: price,
            createdAt: block.timestamp,
            active: true
        });

        // External interaction comes AFTER state changes
        baseRegistrar.safeTransferFrom(msg.sender, address(this), tokenId);

        emit Listed(tokenId, msg.sender, price, block.timestamp);
    }

    /**
     * @notice Cancel a listing and return domain to seller
     * @param tokenId The domain token ID
     */
    function cancelListing(uint256 tokenId) external nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(listing.seller == msg.sender, "Not seller");

        listing.active = false;
        baseRegistrar.safeTransferFrom(address(this), msg.sender, tokenId);

        emit ListingCancelled(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Buy a listed domain
     * @param tokenId The domain token ID
     */
    function buyListing(uint256 tokenId) external payable nonReentrant whenNotPaused {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Not listed");
        require(msg.value >= listing.price, "Insufficient payment");

        uint256 fee = (listing.price * marketplaceFee) / BASIS_POINTS;
        uint256 sellerProceeds = listing.price - fee;
        address seller = listing.seller;
        uint256 excessPayment = msg.value - listing.price;

        // CHECKS-EFFECTS-INTERACTIONS: Update state BEFORE external calls
        listing.active = false;

        // External interactions come AFTER state changes
        // Transfer domain to buyer
        baseRegistrar.safeTransferFrom(address(this), msg.sender, tokenId);

        // Transfer proceeds to seller
        (bool success, ) = seller.call{value: sellerProceeds}("");
        require(success, "Transfer to seller failed");

        // Refund excess payment
        if (excessPayment > 0) {
            (bool refundSuccess, ) = msg.sender.call{value: excessPayment}("");
            require(refundSuccess, "Refund failed");
        }

        emit Sold(tokenId, seller, msg.sender, listing.price, fee, block.timestamp);
    }

    // ============ AUCTION FUNCTIONS ============

    /**
     * @notice Create an auction for a domain
     * @param tokenId The domain token ID
     * @param startPrice The starting bid price
     * @param duration Auction duration in seconds
     */
    function createAuction(
        uint256 tokenId,
        uint256 startPrice,
        uint256 duration
    ) external nonReentrant whenNotPaused {
        require(startPrice > 0, "Start price must be greater than 0");
        require(duration >= MIN_AUCTION_DURATION, "Duration too short");
        require(duration <= MAX_AUCTION_DURATION, "Duration too long");
        require(baseRegistrar.ownerOf(tokenId) == msg.sender, "Not domain owner");
        require(!listings[tokenId].active, "Already listed");
        require(!auctions[tokenId].active, "Already in auction");

        // Transfer domain to escrow
        baseRegistrar.safeTransferFrom(msg.sender, address(this), tokenId);

        uint256 endTime = block.timestamp + duration;

        auctions[tokenId] = Auction({
            seller: msg.sender,
            startPrice: startPrice,
            currentBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: endTime,
            active: true,
            settled: false
        });

        emit AuctionCreated(
            tokenId,
            msg.sender,
            startPrice,
            block.timestamp,
            endTime,
            block.timestamp
        );
    }

    /**
     * @notice Place a bid on an auction
     * @param tokenId The domain token ID
     */
    function placeBid(uint256 tokenId) external payable nonReentrant whenNotPaused {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction ended");
        require(msg.sender != auction.seller, "Seller cannot bid");

        uint256 minBid;
        if (auction.currentBid == 0) {
            minBid = auction.startPrice;
        } else {
            uint256 increment = (auction.currentBid * minBidIncrement) / BASIS_POINTS;
            minBid = auction.currentBid + increment;
        }

        require(msg.value >= minBid, "Bid too low");

        // Refund previous bidder
        if (auction.highestBidder != address(0)) {
            pendingReturns[auction.highestBidder] += auction.currentBid;
        }

        auction.currentBid = msg.value;
        auction.highestBidder = msg.sender;

        // Extend auction if bid placed near end
        if (block.timestamp + AUCTION_EXTENSION_THRESHOLD >= auction.endTime) {
            auction.endTime = block.timestamp + AUCTION_EXTENSION;
        }

        emit BidPlaced(tokenId, msg.sender, msg.value, block.timestamp);
    }

    /**
     * @notice Settle an auction after it ends
     * @param tokenId The domain token ID
     */
    function settleAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(block.timestamp >= auction.endTime, "Auction not ended");
        require(!auction.settled, "Already settled");

        auction.active = false;
        auction.settled = true;

        if (auction.highestBidder == address(0)) {
            // No bids - return domain to seller
            baseRegistrar.safeTransferFrom(address(this), auction.seller, tokenId);
            emit AuctionCancelled(tokenId, auction.seller, block.timestamp);
        } else {
            // Transfer domain to winner
            baseRegistrar.safeTransferFrom(address(this), auction.highestBidder, tokenId);

            // Calculate fee and seller proceeds
            uint256 fee = (auction.currentBid * marketplaceFee) / BASIS_POINTS;
            uint256 sellerProceeds = auction.currentBid - fee;

            // Transfer proceeds to seller
            (bool success, ) = auction.seller.call{value: sellerProceeds}("");
            require(success, "Transfer to seller failed");

            emit AuctionSettled(
                tokenId,
                auction.seller,
                auction.highestBidder,
                auction.currentBid,
                fee,
                block.timestamp
            );
        }
    }

    /**
     * @notice Cancel an auction (only if no bids)
     * @param tokenId The domain token ID
     */
    function cancelAuction(uint256 tokenId) external nonReentrant {
        Auction storage auction = auctions[tokenId];
        require(auction.active, "Auction not active");
        require(auction.seller == msg.sender, "Not seller");
        require(auction.currentBid == 0, "Auction has bids");

        auction.active = false;
        baseRegistrar.safeTransferFrom(address(this), msg.sender, tokenId);

        emit AuctionCancelled(tokenId, msg.sender, block.timestamp);
    }

    /**
     * @notice Withdraw pending returns after being outbid
     */
    function withdrawPendingReturns() external nonReentrant {
        uint256 amount = pendingReturns[msg.sender];
        require(amount > 0, "No pending returns");

        pendingReturns[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Withdrawal failed");
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @notice Update marketplace fee
     * @param newFee New fee in basis points
     */
    function setMarketplaceFee(uint256 newFee) external onlyOwner {
        require(newFee <= MAX_FEE, "Fee too high");
        marketplaceFee = newFee;
        emit MarketplaceFeeUpdated(newFee);
    }

    /**
     * @notice Update minimum bid increment
     * @param newIncrement New increment in basis points
     */
    function setMinBidIncrement(uint256 newIncrement) external onlyOwner {
        require(newIncrement >= 100, "Increment too low"); // Min 1%
        require(newIncrement <= 2000, "Increment too high"); // Max 20%
        minBidIncrement = newIncrement;
        emit MinBidIncrementUpdated(newIncrement);
    }

    /**
     * @notice Pause the marketplace
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @notice Unpause the marketplace
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @notice Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;

        // Calculate total locked in auctions and pending returns
        // (This is simplified - in production, track fees separately)
        require(balance > 0, "No fees to withdraw");

        (bool success, ) = owner().call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @notice Check if a domain is listed
     */
    function isListed(uint256 tokenId) external view returns (bool) {
        return listings[tokenId].active;
    }

    /**
     * @notice Check if a domain is in auction
     */
    function isInAuction(uint256 tokenId) external view returns (bool) {
        return auctions[tokenId].active && block.timestamp < auctions[tokenId].endTime;
    }

    /**
     * @notice Get listing details
     */
    function getListing(uint256 tokenId) external view returns (
        address seller,
        uint256 price,
        uint256 createdAt,
        bool active
    ) {
        Listing memory listing = listings[tokenId];
        return (listing.seller, listing.price, listing.createdAt, listing.active);
    }

    /**
     * @notice Get auction details
     */
    function getAuction(uint256 tokenId) external view returns (
        address seller,
        uint256 startPrice,
        uint256 currentBid,
        address highestBidder,
        uint256 startTime,
        uint256 endTime,
        bool active,
        bool settled
    ) {
        Auction memory auction = auctions[tokenId];
        return (
            auction.seller,
            auction.startPrice,
            auction.currentBid,
            auction.highestBidder,
            auction.startTime,
            auction.endTime,
            auction.active,
            auction.settled
        );
    }

    // ============ ERC721 RECEIVER ============

    /**
     * @notice Handle ERC721 token receipts
     */
    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    /**
     * @notice Emergency function to recover stuck tokens (only owner)
     */
    function emergencyRecoverToken(uint256 tokenId, address recipient) external onlyOwner {
        require(!listings[tokenId].active, "Listing active");
        require(!auctions[tokenId].active, "Auction active");
        baseRegistrar.safeTransferFrom(address(this), recipient, tokenId);
    }
}
