const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const namehash = require("eth-ens-namehash");

describe("Security Features", function () {
    let owner, addr1, addr2, addr3;
    let registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager;
    let baseNode;

    async function deploySecurityTestFixture() {
        [owner, addr1, addr2, addr3] = await ethers.getSigners();

        // Deploy ENSRegistry
        const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
        registry = await ENSRegistry.deploy();
        await registry.waitForDeployment();

        // Deploy BaseRegistrarImplementation
        baseNode = namehash.hash('base');
        const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
        registrar = await BaseRegistrar.deploy(await registry.getAddress(), baseNode);
        await registrar.waitForDeployment();

        // Deploy ReverseRegistrar
        const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
        reverseRegistrar = await ReverseRegistrar.deploy(await registry.getAddress());
        await reverseRegistrar.waitForDeployment();

        // Deploy PublicResolver
        const PublicResolver = await ethers.getContractFactory("PublicResolver");
        resolver = await PublicResolver.deploy(
            await registry.getAddress(),
            ethers.ZeroAddress,
            ethers.ZeroAddress,
            await reverseRegistrar.getAddress()
        );
        await resolver.waitForDeployment();

        // Deploy BasePriceOracle
        const BasePriceOracle = await ethers.getContractFactory("BasePriceOracle");
        priceOracle = await BasePriceOracle.deploy();
        await priceOracle.waitForDeployment();

        // Deploy RegistrationLimiter
        const RegistrationLimiter = await ethers.getContractFactory("RegistrationLimiter");
        registrationLimiter = await RegistrationLimiter.deploy();
        await registrationLimiter.waitForDeployment();

        // Deploy FeeManager (use owner as initial treasury)
        const FeeManager = await ethers.getContractFactory("FeeManager");
        feeManager = await FeeManager.deploy(owner.address);
        await feeManager.waitForDeployment();

        // Deploy ETHRegistrarController
        const BaseController = await ethers.getContractFactory("ETHRegistrarController");
        const minCommitmentAge = 60; // 60 seconds
        const maxCommitmentAge = 86400; // 24 hours

        controller = await BaseController.deploy(
            await registrar.getAddress(),
            await priceOracle.getAddress(),
            minCommitmentAge,
            maxCommitmentAge,
            await reverseRegistrar.getAddress(),
            ethers.ZeroAddress, // No default reverse registrar in this minimal setup
            await registry.getAddress(),
            await registrationLimiter.getAddress(),
            await feeManager.getAddress()
        );
        await controller.waitForDeployment();

        // Authorize controller in RegistrationLimiter
        await registrationLimiter.setController(await controller.getAddress());

        // Set up permissions
        await registry.setSubnodeOwner(
            ethers.ZeroHash,
            ethers.keccak256(ethers.toUtf8Bytes("base")),
            await registrar.getAddress()
        );
        await registrar.addController(await controller.getAddress());

        return { owner, addr1, addr2, addr3, registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager };
    }

    describe("Emergency Pause", function () {
        beforeEach(async function () {
            ({ owner, addr1, addr2, addr3, registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager } = await loadFixture(deploySecurityTestFixture));
        });

        it("Should allow owner to pause the contract", async function () {
            await controller.emergencyPause();
            expect(await controller.isPaused()).to.be.true;
        });

        it("Should not allow non-owner to pause the contract", async function () {
            await expect(controller.connect(addr1).emergencyPause()).to.be.reverted;
        });

        it("Should allow owner to unpause the contract", async function () {
            await controller.emergencyPause();
            await controller.emergencyUnpause();
            expect(await controller.isPaused()).to.be.false;
        });

        it("Should block commit when paused", async function () {
            await controller.emergencyPause();
            const commitment = ethers.keccak256(ethers.toUtf8Bytes("test"));
            await expect(controller.commit(commitment)).to.be.revertedWith("Pausable: paused");
        });

        it("Should block register when paused", async function () {
            await controller.emergencyPause();
            const registration = {
                label: "test",
                owner: addr1.address,
                duration: 365 * 24 * 60 * 60, // 1 year
                secret: ethers.randomBytes(32),
                resolver: ethers.ZeroAddress,
                data: [],
                reverseRecord: 0,
                referrer: ethers.ZeroHash
            };
            await expect(controller.register(registration, { value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("Pausable: paused");
        });

        it("Should block renewals when paused", async function () {
            await controller.emergencyPause();
            await expect(controller.renew("test", 365 * 24 * 60 * 60, ethers.ZeroHash, { value: ethers.parseEther("0.1") }))
                .to.be.revertedWith("Pausable: paused");
        });
    });

    describe("Registration Limiter", function () {
        beforeEach(async function () {
            ({ owner, addr1, addr2, addr3, registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager } = await loadFixture(deploySecurityTestFixture));
        });

        it("Should allow owner to set controller", async function () {
            await registrationLimiter.setController(await controller.getAddress());
            expect(await registrationLimiter.controller()).to.equal(await controller.getAddress());
        });

        it("Should not allow non-owner to set controller", async function () {
            await expect(registrationLimiter.connect(addr1).setController(addr1.address)).to.be.reverted;
        });

        it("Should not allow unauthorized address to record registration", async function () {
            await expect(registrationLimiter.connect(addr1).recordRegistration(addr1.address))
                .to.be.revertedWith("Not authorized");
        });

        it("Should track registration count correctly", async function () {
            // Set the test account as controller for this test
            await registrationLimiter.setController(owner.address);

            // First record a registration
            await registrationLimiter.recordRegistration(addr1.address);

            const currentRegistrations = await registrationLimiter.getCurrentRegistrations(addr1.address);
            expect(currentRegistrations).to.equal(1);
        });

        it("Should prevent exceeding registration limit", async function () {
            // Set the test account as controller for this test
            await registrationLimiter.setController(owner.address);

            // Record maximum registrations
            for (let i = 0; i < 10; i++) {
                await registrationLimiter.recordRegistration(addr1.address);
            }

            // Should fail on 11th registration
            await expect(registrationLimiter.recordRegistration(addr1.address))
                .to.be.revertedWith("Registration limit exceeded for this time period");
        });

        it("Should allow updating registration limits", async function () {
            await registrationLimiter.setMaxRegistrations(20);
            expect(await registrationLimiter.maxRegistrationsPerWindow()).to.equal(20);
        });

        it("Should allow updating time window", async function () {
            await registrationLimiter.setTimeWindow(7200); // 2 hours
            expect(await registrationLimiter.timeWindow()).to.equal(7200);
        });
    });

    describe("Fee Manager", function () {
        beforeEach(async function () {
            ({ owner, addr1, addr2, addr3, registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager } = await loadFixture(deploySecurityTestFixture));
        });

        it("Should set correct treasury on deployment", async function () {
            expect(await feeManager.treasury()).to.equal(owner.address);
        });

        it("Should allow owner to update treasury", async function () {
            await feeManager.setTreasury(addr1.address);
            expect(await feeManager.treasury()).to.equal(addr1.address);
        });

        it("Should not allow non-owner to update treasury", async function () {
            await expect(feeManager.connect(addr1).setTreasury(addr1.address)).to.be.reverted;
        });

        it("Should receive ETH correctly", async function () {
            const amount = ethers.parseEther("1.0");
            await addr1.sendTransaction({
                to: await feeManager.getAddress(),
                value: amount
            });
            expect(await ethers.provider.getBalance(await feeManager.getAddress())).to.equal(amount);
        });

        it("Should allow requesting withdrawal with timelock", async function () {
            // First send some ETH to the contract
            const amount = ethers.parseEther("1.0");
            await addr1.sendTransaction({
                to: await feeManager.getAddress(),
                value: amount
            });

            const tx = await feeManager.requestWithdrawal(amount, addr1.address);
            const receipt = await tx.wait();

            // Get the withdrawal ID from the event
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'WithdrawalRequested');
            const withdrawalId = event.args[0];

            const request = await feeManager.pendingWithdrawals(withdrawalId);
            expect(request.amount).to.equal(amount);
            expect(request.recipient).to.equal(addr1.address);
            expect(request.executed).to.be.false;
        });

        it("Should not allow executing withdrawal before timelock", async function () {
            const amount = ethers.parseEther("1.0");
            await addr1.sendTransaction({
                to: await feeManager.getAddress(),
                value: amount
            });

            const tx = await feeManager.requestWithdrawal(amount, addr1.address);
            const receipt = await tx.wait();

            // Get the withdrawal ID from the event
            const event = receipt.logs.find(log => log.fragment && log.fragment.name === 'WithdrawalRequested');
            const withdrawalId = event.args[0];

            await expect(feeManager.executeWithdrawal(withdrawalId))
                .to.be.revertedWith("Withdrawal still in timelock period");
        });

        it("Should allow emergency withdrawal up to limit", async function () {
            const amount = ethers.parseEther("5.0"); // Under 10 ETH limit
            await addr1.sendTransaction({
                to: await feeManager.getAddress(),
                value: amount
            });

            const treasuryBefore = await ethers.provider.getBalance(owner.address); // treasury is owner
            await feeManager.emergencyWithdraw(amount);
            const treasuryAfter = await ethers.provider.getBalance(owner.address);

            expect(treasuryAfter - treasuryBefore).to.be.closeTo(amount, ethers.parseEther("0.01")); // Account for gas
        });

        it("Should not allow emergency withdrawal above limit", async function () {
            const amount = ethers.parseEther("15.0"); // Over 10 ETH limit
            await addr1.sendTransaction({
                to: await feeManager.getAddress(),
                value: amount
            });

            await expect(feeManager.emergencyWithdraw(amount))
                .to.be.revertedWith("Emergency withdrawal limited to 10 ETH");
        });
    });

    describe("Access Control", function () {
        beforeEach(async function () {
            ({ owner, addr1, addr2, addr3, registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager } = await loadFixture(deploySecurityTestFixture));
        });

        it.skip("Should allow only owner to withdraw from controller", async function () {
            // Send some ETH to controller
            await addr1.sendTransaction({
                to: await controller.getAddress(),
                value: ethers.parseEther("1.0")
            });

            await controller.connect(owner).withdrawToFeeManager();

            // Non-owner should not be able to withdraw
            await expect(controller.connect(addr1).withdrawToFeeManager()).to.be.reverted;
        });

        it("Should allow only owner to set referrer fee percentage", async function () {
            await controller.setReferrerFeePercentage(300); // 3%
            expect(await controller.referrerFeePercentage()).to.equal(300);

            await expect(controller.connect(addr1).setReferrerFeePercentage(200)).to.be.reverted;
        });

        it("Should not allow referrer fee percentage above 10%", async function () {
            await expect(controller.setReferrerFeePercentage(1100)) // 11%
                .to.be.revertedWith("Fee cannot exceed 10%");
        });
    });

    describe("Reentrancy Protection", function () {
        let maliciousContract;

        beforeEach(async function () {
            ({ owner, addr1, addr2, addr3, registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager } = await loadFixture(deploySecurityTestFixture));

            // Deploy a malicious contract that tries to reenter
            const MaliciousContract = await ethers.getContractFactory("TestMaliciousContract");
            maliciousContract = await MaliciousContract.deploy(await controller.getAddress());
            await maliciousContract.waitForDeployment();
        });

        it("Should prevent reentrancy in register function", async function () {
            // Fund the malicious contract
            await addr1.sendTransaction({
                to: await maliciousContract.getAddress(),
                value: ethers.parseEther("2.0")
            });

            await expect(maliciousContract.attackRegister())
                .to.be.reverted; // Custom error or revert reason
        });
    });
});
