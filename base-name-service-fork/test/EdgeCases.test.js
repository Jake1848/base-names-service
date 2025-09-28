const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const namehash = require("eth-ens-namehash");

describe("ETHRegistrarController Edge Cases", function () {
  let controller, baseRegistrar, priceOracle, ens, resolver;
  let registrationLimiter, feeManager;
  let owner, user1, user2, referrer;
  const COMMITMENT_AGE_MIN = 60; // 1 minute
  const COMMITMENT_AGE_MAX = 86400; // 1 day

  beforeEach(async function () {
    [owner, user1, user2, referrer] = await ethers.getSigners();

    // Deploy ENS Registry
    const ENS = await ethers.getContractFactory("ENSRegistry");
    ens = await ENS.deploy();
    await ens.waitForDeployment();

    // Deploy BaseRegistrar for .base
    const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
    baseRegistrar = await BaseRegistrar.deploy(
      await ens.getAddress(),
      namehash.hash("base")
    );
    await baseRegistrar.waitForDeployment();

    // Deploy Reverse Registrars
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
    const reverseRegistrar = await ReverseRegistrar.deploy(await ens.getAddress());
    await reverseRegistrar.waitForDeployment();
    const DefaultReverseRegistrar = await ethers.getContractFactory("DefaultReverseRegistrar");
    const defaultReverseRegistrar = await DefaultReverseRegistrar.deploy(await ens.getAddress());
    await defaultReverseRegistrar.waitForDeployment();

    // Deploy Resolver
    const Resolver = await ethers.getContractFactory("PublicResolver");
    resolver = await Resolver.deploy(
      await ens.getAddress(),
      ethers.ZeroAddress,
      ethers.ZeroAddress,
      await reverseRegistrar.getAddress()
    );
    await resolver.waitForDeployment();

    // Deploy Price Oracle (no constructor params)
    const PriceOracle = await ethers.getContractFactory("BasePriceOracle");
    priceOracle = await PriceOracle.deploy();
    await priceOracle.waitForDeployment();

    // Deploy RegistrationLimiter
    const RegistrationLimiter = await ethers.getContractFactory("RegistrationLimiter");
    registrationLimiter = await RegistrationLimiter.deploy();
    await registrationLimiter.waitForDeployment();

    // Deploy FeeManager
    const FeeManager = await ethers.getContractFactory("FeeManager");
    feeManager = await FeeManager.deploy(await owner.getAddress());
    await feeManager.waitForDeployment();

    // Deploy ETHRegistrarController
    const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
    controller = await ETHRegistrarController.deploy(
      await baseRegistrar.getAddress(),
      await priceOracle.getAddress(),
      COMMITMENT_AGE_MIN,
      COMMITMENT_AGE_MAX,
      await reverseRegistrar.getAddress(),
      await defaultReverseRegistrar.getAddress(),
      await ens.getAddress(),
      await registrationLimiter.getAddress(),
      await feeManager.getAddress()
    );
    await controller.waitForDeployment();

    // Set controller as controller in registrationLimiter
    await registrationLimiter.setController(await controller.getAddress());

    // Add controller to baseRegistrar
    await baseRegistrar.addController(await controller.getAddress());

    // Setup ENS .base TLD
    await ens.setSubnodeOwner(
      ethers.ZeroHash,
      ethers.id("base"),
      await baseRegistrar.getAddress()
    );
  });

  describe("Label Validation Edge Cases", function () {
    it("Should reject labels with uppercase letters", async function () {
      expect(await controller.valid("ABC")).to.be.false;
      expect(await controller.valid("Test")).to.be.false;
      expect(await controller.valid("teST")).to.be.false;
    });

    it("Should reject labels with special characters", async function () {
      expect(await controller.valid("test@")).to.be.false;
      expect(await controller.valid("test!")).to.be.false;
      expect(await controller.valid("test#")).to.be.false;
      expect(await controller.valid("test$")).to.be.false;
      expect(await controller.valid("test%")).to.be.false;
      expect(await controller.valid("test.")).to.be.false;
      expect(await controller.valid("test_")).to.be.false;
    });

    it("Should reject labels with unicode characters", async function () {
      expect(await controller.valid("tést")).to.be.false;
      expect(await controller.valid("テスト")).to.be.false;
      expect(await controller.valid("🚀")).to.be.false;
      expect(await controller.valid("test😊")).to.be.false;
    });

    it("Should reject labels starting or ending with hyphen", async function () {
      expect(await controller.valid("-test")).to.be.false;
      expect(await controller.valid("test-")).to.be.false;
      expect(await controller.valid("-test-")).to.be.false;
    });

    it("Should reject labels with consecutive hyphens", async function () {
      expect(await controller.valid("test--name")).to.be.false;
      expect(await controller.valid("my---domain")).to.be.false;
    });

    it("Should accept valid labels", async function () {
      expect(await controller.valid("abc")).to.be.true;
      expect(await controller.valid("test")).to.be.true;
      expect(await controller.valid("my-domain")).to.be.true;
      expect(await controller.valid("web3-app")).to.be.true;
      expect(await controller.valid("123")).to.be.true;
      expect(await controller.valid("a1b2c3")).to.be.true;
    });

    it("Should reject labels shorter than 3 characters", async function () {
      expect(await controller.valid("")).to.be.false;
      expect(await controller.valid("a")).to.be.false;
      expect(await controller.valid("ab")).to.be.false;
    });
  });

  describe("Commitment Age Boundary Tests", function () {
    it("Should enforce minimum commitment age of at least 1 minute", async function () {
      // Test is covered by constructor validation
      // Attempting to deploy with invalid min age should fail
      const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
      const br = await baseRegistrar.getAddress();
      const po = await priceOracle.getAddress();
      const en = await ens.getAddress();
      const rl = await registrationLimiter.getAddress();
      const fm = await feeManager.getAddress();
      await expect(
        ETHRegistrarController.deploy(
          br,
          po,
          30, // 30 seconds - too low
          COMMITMENT_AGE_MAX,
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          en,
          rl,
          fm
        )
      ).to.be.revertedWith("Min commitment age too low");
    });

    it("Should enforce maximum commitment age of at most 30 days", async function () {
      const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
      const br2 = await baseRegistrar.getAddress();
      const po2 = await priceOracle.getAddress();
      const en2 = await ens.getAddress();
      const rl2 = await registrationLimiter.getAddress();
      const fm2 = await feeManager.getAddress();
      const thirtyOneDays = 31 * 24 * 60 * 60;
      await expect(
        ETHRegistrarController.deploy(
          br2,
          po2,
          COMMITMENT_AGE_MIN,
          thirtyOneDays, // 31 days - too high
          ethers.ZeroAddress,
          ethers.ZeroAddress,
          en2,
          rl2,
          fm2
        )
      ).to.be.revertedWith("Max commitment age too high");
    });

    it("Should reject registration if commitment is too new", async function () {
      const secret = ethers.randomBytes(32);
      const label = "testname";
      const duration = 365 * 24 * 60 * 60; // 1 year

      const commitment = await controller.makeCommitment({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.ZeroHash
      });

      await controller.connect(user1).commit(commitment);

      const price = await controller.rentPrice(label, duration);
      const totalPrice = price.base + price.premium;

      // Try to register immediately (before min commitment age)
      await expect(
        controller.connect(user1).register({
          label: label,
          owner: await user1.getAddress(),
          duration: duration,
          secret: secret,
          resolver: await resolver.getAddress(),
          data: [],
          reverseRecord: 0,
          referrer: ethers.ZeroHash
        }, { value: totalPrice })
      ).to.be.revertedWithCustomError(controller, "CommitmentTooNew");
    });

    it("Should reject registration if commitment is too old", async function () {
      const secret = ethers.randomBytes(32);
      const label = "testname";
      const duration = 365 * 24 * 60 * 60; // 1 year

      const commitment = await controller.makeCommitment({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.ZeroHash
      });

      await controller.connect(user1).commit(commitment);

      // Fast forward beyond max commitment age
      await time.increase(COMMITMENT_AGE_MAX + 1);

      const price = await controller.rentPrice(label, duration);
      const totalPrice = price.base + price.premium;

      await expect(
        controller.connect(user1).register({
          label: label,
          owner: await user1.getAddress(),
          duration: duration,
          secret: secret,
          resolver: await resolver.getAddress(),
          data: [],
          reverseRecord: 0,
          referrer: ethers.ZeroHash
        }, { value: totalPrice })
      ).to.be.revertedWithCustomError(controller, "CommitmentTooOld");
    });
  });

  describe("Referrer Fee Edge Cases", function () {
    it("Should handle referrer payments correctly", async function () {
      const secret = ethers.randomBytes(32);
      const label = "testname";
      const duration = 365 * 24 * 60 * 60; // 1 year

      const commitment = await controller.makeCommitment({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.zeroPadValue(await referrer.getAddress(), 32)
      });

      await controller.connect(user1).commit(commitment);
      await time.increase(COMMITMENT_AGE_MIN + 1);

      const price = await controller.rentPrice(label, duration);
      const totalPrice = price.base + price.premium;
      const referrerFeePercentage = await controller.referrerFeePercentage();
      const expectedReferrerFee = (totalPrice * BigInt(referrerFeePercentage)) / 10000n;

      const referrerBalanceBefore = await ethers.provider.getBalance(await referrer.getAddress());

      await controller.connect(user1).register({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.zeroPadValue(await referrer.getAddress(), 32)
      }, { value: totalPrice });

      const referrerBalanceAfter = await ethers.provider.getBalance(await referrer.getAddress());
      expect(referrerBalanceAfter - referrerBalanceBefore).to.equal(expectedReferrerFee);
    });

    it("Should handle contract referrer addresses", async function () {
      // Use FeeManager (has a receive function) as a contract referrer
      const contractReferrer = feeManager;

      const secret = ethers.randomBytes(32);
      const label = "testcontract";
      const duration = 365 * 24 * 60 * 60;

      const commitment = await controller.makeCommitment({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.zeroPadValue(await contractReferrer.getAddress(), 32)
      });

      await controller.connect(user1).commit(commitment);
      await time.increase(COMMITMENT_AGE_MIN + 1);

      const price = await controller.rentPrice(label, duration);
      const totalPrice = price.base + price.premium;

      // Should not revert when paying to contract
      await expect(
        controller.connect(user1).register({
          label: label,
          owner: await user1.getAddress(),
          duration: duration,
          secret: secret,
          resolver: await resolver.getAddress(),
          data: [],
          reverseRecord: 0,
          referrer: ethers.zeroPadValue(await contractReferrer.getAddress(), 32)
        }, { value: totalPrice })
      ).to.not.be.reverted;
    });

    it("Should emit correct events for referrer fee changes", async function () {
      const newPercentage = 750; // 7.5%
      await expect(controller.setReferrerFeePercentage(newPercentage))
        .to.emit(controller, "ReferrerFeePercentageChanged")
        .withArgs(500, newPercentage);
    });

    it("Should enforce maximum referrer fee percentage", async function () {
      await expect(
        controller.setReferrerFeePercentage(1001) // 10.01%
      ).to.be.revertedWith("Fee cannot exceed 10%");
    });
  });

  describe("Refund Edge Cases", function () {
    it("Should handle refunds to EOA correctly", async function () {
      const secret = ethers.randomBytes(32);
      const label = "refundtest";
      const duration = 365 * 24 * 60 * 60;

      const commitment = await controller.makeCommitment({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.ZeroHash
      });

      await controller.connect(user1).commit(commitment);
      await time.increase(COMMITMENT_AGE_MIN + 1);

      const price = await controller.rentPrice(label, duration);
      const totalPrice = price.base + price.premium;
      const overpayment = ethers.parseEther("1");
      const paymentAmount = totalPrice + overpayment;

      const balanceBefore = await ethers.provider.getBalance(await user1.getAddress());

      const tx = await controller.connect(user1).register({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.ZeroHash
      }, { value: paymentAmount });

      await tx.wait();

      const balanceAfter = await ethers.provider.getBalance(await user1.getAddress());
      const spent = balanceBefore - balanceAfter; // includes gas

      // Spent should be between the required price and the amount sent
      expect(spent).to.be.gte(totalPrice);
      expect(spent).to.be.lte(paymentAmount);
    });
  });

  describe("Registration Limiter Integration", function () {
    it("Should respect rate limiting pre-check", async function () {
      // Set limit to 2 registrations per window
      await registrationLimiter.setMaxRegistrations(2);

      const secret = ethers.randomBytes(32);
      const duration = 365 * 24 * 60 * 60;

      // Register 2 names successfully
      for (let i = 0; i < 2; i++) {
        const label = `limit${i}`;
        const commitment = await controller.makeCommitment({
          label: label,
          owner: await user1.getAddress(),
          duration: duration,
          secret: secret,
          resolver: await resolver.getAddress(),
          data: [],
          reverseRecord: 0,
          referrer: ethers.ZeroHash
        });

        await controller.connect(user1).commit(commitment);
        await time.increase(COMMITMENT_AGE_MIN + 1);

        const price = await controller.rentPrice(label, duration);
        const totalPrice = price.base + price.premium;

        await controller.connect(user1).register({
          label: label,
          owner: await user1.getAddress(),
          duration: duration,
          secret: secret,
          resolver: await resolver.getAddress(),
          data: [],
          reverseRecord: 0,
          referrer: ethers.ZeroHash
        }, { value: totalPrice });
      }

      // Third registration should fail
      const label = "limit3";
      const commitment = await controller.makeCommitment({
        label: label,
        owner: await user1.getAddress(),
        duration: duration,
        secret: secret,
        resolver: await resolver.getAddress(),
        data: [],
        reverseRecord: 0,
        referrer: ethers.ZeroHash
      });

      await controller.connect(user1).commit(commitment);
      await time.increase(COMMITMENT_AGE_MIN + 1);

      const price = await controller.rentPrice(label, duration);
      const totalPrice = price.base + price.premium;

      await expect(
        controller.connect(user1).register({
          label: label,
          owner: await user1.getAddress(),
          duration: duration,
          secret: secret,
          resolver: await resolver.getAddress(),
          data: [],
          reverseRecord: 0,
          referrer: ethers.ZeroHash
        }, { value: totalPrice })
      ).to.be.revertedWith("Registration limit exceeded");
    });
  });

  describe("Admin Action Events", function () {
    it("Should emit event when making a commitment", async function () {
      const commitment = ethers.id("test-commitment");

      await expect(controller.commit(commitment))
        .to.emit(controller, "CommitmentMade")
        .withArgs(commitment, await time.latest() + 1);
    });

    it("Should emit event when withdrawing to fee manager", async function () {
      // Send some ETH to the controller
      await owner.sendTransaction({
        to: await controller.getAddress(),
        value: ethers.parseEther("10")
      });

      const balance = await ethers.provider.getBalance(await controller.getAddress());

      await expect(controller.withdraw())
        .to.emit(controller, "WithdrawalToFeeManager")
        .withArgs(balance);
    });
  });
});

// Mock contract for testing
// Add this to a separate file or at the end of your test suite
const mockReverseRegistrarSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract MockReverseRegistrar {
    function setNameForAddr(
        address addr,
        address owner,
        address resolver,
        string memory name
    ) external returns (bytes32) {
        return bytes32(0);
    }

    receive() external payable {}
}
`;
