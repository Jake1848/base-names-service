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

    // Track accumulated fees (separate from locked funds)
    uint256 public accumulatedFees;

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

