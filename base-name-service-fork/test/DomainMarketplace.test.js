const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("DomainMarketplace", function () {
    async function deployMarketplaceFixture() {
        const [owner, seller, buyer, bidder1, bidder2] = await ethers.getSigners();

        // Deploy mock ENS registry
        const MockENS = await ethers.getContractFactory("MockENS");
        const ens = await MockENS.deploy();
        const baseNode = ethers.keccak256(ethers.toUtf8Bytes("base"));

        // Deploy BaseRegistrar with mock ENS
        const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
        const registrar = await BaseRegistrar.deploy(
            await ens.getAddress(),
            baseNode
        );

        // Set BaseRegistrar as owner of base node (required for 'live' modifier)
        await ens.setOwner(baseNode, await registrar.getAddress());

        // Deploy Marketplace
        const Marketplace = await ethers.getContractFactory("DomainMarketplace");
        const marketplace = await Marketplace.deploy(await registrar.getAddress());

        // Mint some test domains
        const tokenId1 = ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes("test")));
        const tokenId2 = ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes("premium")));
        const tokenId3 = ethers.toBigInt(ethers.keccak256(ethers.toUtf8Bytes("auction")));

        await registrar.addController(owner.address);

        const oneDayInSeconds = 365 * 24 * 60 * 60;
        await registrar.register(tokenId1, seller.address, oneDayInSeconds);
        await registrar.register(tokenId2, seller.address, oneDayInSeconds);
        await registrar.register(tokenId3, seller.address, oneDayInSeconds);

        return {
            marketplace,
            registrar,
            owner,
            seller,
            buyer,
            bidder1,
            bidder2,
            tokenId1,
            tokenId2,
            tokenId3
        };
    }

    describe("Deployment", function () {
        it("Should set the correct registrar address", async function () {
            const { marketplace, registrar } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.baseRegistrar()).to.equal(await registrar.getAddress());
        });

        it("Should set default marketplace fee to 2.5%", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.marketplaceFee()).to.equal(250); // 2.5%
        });

        it("Should set default min bid increment to 5%", async function () {
            const { marketplace } = await loadFixture(deployMarketplaceFixture);
            expect(await marketplace.minBidIncrement()).to.equal(500); // 5%
        });
    });

    describe("Fixed-Price Listings", function () {
        it("Should allow domain owner to create listing", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const listPrice = ethers.parseEther("1.0");

            // Approve marketplace to transfer domain
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);

            // Create listing
            await expect(marketplace.connect(seller).createListing(tokenId1, listPrice))
                .to.emit(marketplace, "Listed")
                .withArgs(tokenId1, seller.address, listPrice, await time.latest() + 1);

            // Verify domain transferred to marketplace
            expect(await registrar.ownerOf(tokenId1)).to.equal(await marketplace.getAddress());

            // Verify listing details
            const listing = await marketplace.getListing(tokenId1);
            expect(listing.seller).to.equal(seller.address);
            expect(listing.price).to.equal(listPrice);
            expect(listing.active).to.be.true;
        });

        it("Should not allow listing with zero price", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);

            await expect(
                marketplace.connect(seller).createListing(tokenId1, 0)
            ).to.be.revertedWith("Price must be greater than 0");
        });

        it("Should not allow non-owner to create listing", async function () {
            const { marketplace, registrar, buyer, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const listPrice = ethers.parseEther("1.0");

            await expect(
                marketplace.connect(buyer).createListing(tokenId1, listPrice)
            ).to.be.revertedWith("Not domain owner");
        });

        it("Should allow seller to cancel listing", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const listPrice = ethers.parseEther("1.0");

            // Create listing
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createListing(tokenId1, listPrice);

            // Cancel listing
            await expect(marketplace.connect(seller).cancelListing(tokenId1))
                .to.emit(marketplace, "ListingCancelled")
                .withArgs(tokenId1, seller.address, await time.latest() + 1);

            // Verify domain returned to seller
            expect(await registrar.ownerOf(tokenId1)).to.equal(seller.address);

            // Verify listing inactive
            const listing = await marketplace.getListing(tokenId1);
            expect(listing.active).to.be.false;
        });

        it("Should allow buyer to purchase listed domain", async function () {
            const { marketplace, registrar, seller, buyer, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const listPrice = ethers.parseEther("1.0");

            // Create listing
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createListing(tokenId1, listPrice);

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            // Buy listing
            await expect(marketplace.connect(buyer).buyListing(tokenId1, { value: listPrice }))
                .to.emit(marketplace, "Sold");

            // Verify domain transferred to buyer
            expect(await registrar.ownerOf(tokenId1)).to.equal(buyer.address);

            // Verify seller received proceeds (minus 2.5% fee)
            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
            const expectedProceeds = listPrice * ethers.toBigInt(9750) / ethers.toBigInt(10000); // 97.5%
            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedProceeds);

            // Verify listing inactive
            const listing = await marketplace.getListing(tokenId1);
            expect(listing.active).to.be.false;
        });

        it("Should refund excess payment", async function () {
            const { marketplace, registrar, seller, buyer, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const listPrice = ethers.parseEther("1.0");
            const overpayment = ethers.parseEther("1.5");

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createListing(tokenId1, listPrice);

            const buyerBalanceBefore = await ethers.provider.getBalance(buyer.address);

            // Buy with overpayment
            const tx = await marketplace.connect(buyer).buyListing(tokenId1, { value: overpayment });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;

            const buyerBalanceAfter = await ethers.provider.getBalance(buyer.address);

            // Buyer should only pay list price + gas
            const actualCost = buyerBalanceBefore - buyerBalanceAfter;
            expect(actualCost).to.be.closeTo(listPrice + gasUsed, ethers.parseEther("0.001"));
        });

        it("Should not allow buying with insufficient payment", async function () {
            const { marketplace, registrar, seller, buyer, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const listPrice = ethers.parseEther("1.0");
            const insufficientPayment = ethers.parseEther("0.5");

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createListing(tokenId1, listPrice);

            await expect(
                marketplace.connect(buyer).buyListing(tokenId1, { value: insufficientPayment })
            ).to.be.revertedWith("Insufficient payment");
        });
    });

    describe("Auctions", function () {
        it("Should allow domain owner to create auction", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const duration = 24 * 60 * 60; // 1 day

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);

            const currentTime = await time.latest();
            const expectedEndTime = currentTime + duration + 1;

            await expect(marketplace.connect(seller).createAuction(tokenId1, startPrice, duration))
                .to.emit(marketplace, "AuctionCreated");

            // Verify domain transferred to marketplace
            expect(await registrar.ownerOf(tokenId1)).to.equal(await marketplace.getAddress());

            // Verify auction details
            const auction = await marketplace.getAuction(tokenId1);
            expect(auction.seller).to.equal(seller.address);
            expect(auction.startPrice).to.equal(startPrice);
            expect(auction.active).to.be.true;
            expect(auction.endTime).to.be.closeTo(expectedEndTime, 2);
        });

        it("Should not allow auction with duration too short", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const duration = 30 * 60; // 30 minutes - less than MIN_AUCTION_DURATION (1 hour)

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);

            await expect(
                marketplace.connect(seller).createAuction(tokenId1, startPrice, duration)
            ).to.be.revertedWith("Duration too short");
        });

        it("Should allow placing bid on auction", async function () {
            const { marketplace, registrar, seller, bidder1, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const bidAmount = ethers.parseEther("1.5");
            const duration = 24 * 60 * 60;

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);

            await expect(marketplace.connect(bidder1).placeBid(tokenId1, { value: bidAmount }))
                .to.emit(marketplace, "BidPlaced")
                .withArgs(tokenId1, bidder1.address, bidAmount, await time.latest() + 1);

            // Verify auction state
            const auction = await marketplace.getAuction(tokenId1);
            expect(auction.currentBid).to.equal(bidAmount);
            expect(auction.highestBidder).to.equal(bidder1.address);
        });

        it("Should enforce minimum bid increment", async function () {
            const { marketplace, registrar, seller, bidder1, bidder2, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const firstBid = ethers.parseEther("1.0");
            const insufficientBid = ethers.parseEther("1.04"); // Less than 5% increment
            const duration = 24 * 60 * 60;

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);

            // First bid
            await marketplace.connect(bidder1).placeBid(tokenId1, { value: firstBid });

            // Second bid with insufficient increment
            await expect(
                marketplace.connect(bidder2).placeBid(tokenId1, { value: insufficientBid })
            ).to.be.revertedWith("Bid too low");
        });

        it("Should refund previous bidder when outbid", async function () {
            const { marketplace, registrar, seller, bidder1, bidder2, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const firstBid = ethers.parseEther("1.0");
            const secondBid = ethers.parseEther("1.1");
            const duration = 24 * 60 * 60;

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);

            // First bid
            await marketplace.connect(bidder1).placeBid(tokenId1, { value: firstBid });

            // Second bid (outbids first)
            await marketplace.connect(bidder2).placeBid(tokenId1, { value: secondBid });

            // Verify bidder1 has pending returns
            expect(await marketplace.pendingReturns(bidder1.address)).to.equal(firstBid);

            // Withdraw pending returns
            const balanceBefore = await ethers.provider.getBalance(bidder1.address);
            const tx = await marketplace.connect(bidder1).withdrawPendingReturns();
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const balanceAfter = await ethers.provider.getBalance(bidder1.address);

            expect(balanceAfter - balanceBefore).to.equal(firstBid - gasUsed);
        });

        it("Should extend auction if bid placed near end", async function () {
            const { marketplace, registrar, seller, bidder1, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const bidAmount = ethers.parseEther("1.0");
            const duration = 1 * 60 * 60; // 1 hour

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);

            // Fast forward to near end (9 minutes before end)
            const auctionBefore = await marketplace.getAuction(tokenId1);
            const originalEndTime = auctionBefore.endTime;
            await time.increaseTo(originalEndTime - ethers.toBigInt(9 * 60));

            // Place bid
            await marketplace.connect(bidder1).placeBid(tokenId1, { value: bidAmount });

            // Verify auction extended
            const auctionAfter = await marketplace.getAuction(tokenId1);
            expect(auctionAfter.endTime).to.be.gt(originalEndTime);
        });

        it("Should settle auction with winner", async function () {
            const { marketplace, registrar, seller, bidder1, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const bidAmount = ethers.parseEther("1.5");
            const duration = 1 * 60 * 60;

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);
            await marketplace.connect(bidder1).placeBid(tokenId1, { value: bidAmount });

            // Fast forward past auction end
            const auction = await marketplace.getAuction(tokenId1);
            await time.increaseTo(auction.endTime + ethers.toBigInt(1));

            const sellerBalanceBefore = await ethers.provider.getBalance(seller.address);

            // Settle auction
            await expect(marketplace.settleAuction(tokenId1))
                .to.emit(marketplace, "AuctionSettled");

            // Verify domain transferred to winner
            expect(await registrar.ownerOf(tokenId1)).to.equal(bidder1.address);

            // Verify seller received proceeds (minus 2.5% fee)
            const sellerBalanceAfter = await ethers.provider.getBalance(seller.address);
            const expectedProceeds = bidAmount * ethers.toBigInt(9750) / ethers.toBigInt(10000);
            expect(sellerBalanceAfter - sellerBalanceBefore).to.equal(expectedProceeds);
        });

        it("Should allow seller to cancel auction with no bids", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const duration = 24 * 60 * 60;

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);

            // Cancel auction
            await expect(marketplace.connect(seller).cancelAuction(tokenId1))
                .to.emit(marketplace, "AuctionCancelled");

            // Verify domain returned to seller
            expect(await registrar.ownerOf(tokenId1)).to.equal(seller.address);
        });

        it("Should not allow cancelling auction with bids", async function () {
            const { marketplace, registrar, seller, bidder1, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            const startPrice = ethers.parseEther("1.0");
            const bidAmount = ethers.parseEther("1.0");
            const duration = 24 * 60 * 60;

            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);
            await marketplace.connect(bidder1).placeBid(tokenId1, { value: bidAmount });

            await expect(
                marketplace.connect(seller).cancelAuction(tokenId1)
            ).to.be.revertedWith("Auction has bids");
        });
    });

    describe("Admin Functions", function () {
        it("Should allow owner to update marketplace fee", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);

            const newFee = 500; // 5%

            await expect(marketplace.connect(owner).setMarketplaceFee(newFee))
                .to.emit(marketplace, "MarketplaceFeeUpdated")
                .withArgs(newFee);

            expect(await marketplace.marketplaceFee()).to.equal(newFee);
        });

        it("Should not allow setting fee above maximum", async function () {
            const { marketplace, owner } = await loadFixture(deployMarketplaceFixture);

            const tooHighFee = 1500; // 15% - above MAX_FEE of 10%

            await expect(
                marketplace.connect(owner).setMarketplaceFee(tooHighFee)
            ).to.be.revertedWith("Fee too high");
        });

        it("Should allow owner to pause marketplace", async function () {
            const { marketplace, registrar, owner, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(owner).pause();

            const listPrice = ethers.parseEther("1.0");
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);

            await expect(
                marketplace.connect(seller).createListing(tokenId1, listPrice)
            ).to.be.revertedWith("Pausable: paused");
        });

        it("Should allow owner to unpause marketplace", async function () {
            const { marketplace, registrar, owner, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            await marketplace.connect(owner).pause();
            await marketplace.connect(owner).unpause();

            const listPrice = ethers.parseEther("1.0");
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);

            await expect(marketplace.connect(seller).createListing(tokenId1, listPrice))
                .to.emit(marketplace, "Listed");
        });
    });

    describe("View Functions", function () {
        it("Should correctly report if domain is listed", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            expect(await marketplace.isListed(tokenId1)).to.be.false;

            const listPrice = ethers.parseEther("1.0");
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createListing(tokenId1, listPrice);

            expect(await marketplace.isListed(tokenId1)).to.be.true;
        });

        it("Should correctly report if domain is in auction", async function () {
            const { marketplace, registrar, seller, tokenId1 } = await loadFixture(deployMarketplaceFixture);

            expect(await marketplace.isInAuction(tokenId1)).to.be.false;

            const startPrice = ethers.parseEther("1.0");
            const duration = 24 * 60 * 60;
            await registrar.connect(seller).approve(await marketplace.getAddress(), tokenId1);
            await marketplace.connect(seller).createAuction(tokenId1, startPrice, duration);

            expect(await marketplace.isInAuction(tokenId1)).to.be.true;
        });
    });
});
