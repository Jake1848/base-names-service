const { expect } = require("chai");
const { ethers } = require("hardhat");
const namehash = require("eth-ens-namehash");

describe("Base Name Service", function () {
  let owner, addr1, addr2;
  let registry, registrar, controller, resolver, reverseRegistrar, priceOracle, registrationLimiter, feeManager;
  let baseNode;

  // Helper function to calculate labelhash
  function labelhash(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
  }

  beforeEach(async function () {
    // Get test accounts
    [owner, addr1, addr2] = await ethers.getSigners();

    baseNode = namehash.hash('base');

    // Deploy ENSRegistry
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
    registry = await ENSRegistry.deploy();
    await registry.waitForDeployment();

    // Deploy BaseRegistrarImplementation
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
      ethers.ZeroAddress, // No wrapper
      ethers.ZeroAddress, // No controller
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
      ethers.ZeroHash, // root
      labelhash('base'),
      await registrar.getAddress()
    );

    await registrar.addController(await controller.getAddress());

    // Set up reverse resolution
    await registry.setSubnodeOwner(
      ethers.ZeroHash,
      labelhash('reverse'),
      owner.address
    );
    await registry.setSubnodeOwner(
      namehash.hash('reverse'),
      labelhash('addr'),
      await reverseRegistrar.getAddress()
    );

    await reverseRegistrar.setDefaultResolver(await resolver.getAddress());
  });

  describe("Deployment", function () {
    it("Should deploy all contracts successfully", async function () {
      expect(await registry.getAddress()).to.be.properAddress;
      expect(await registrar.getAddress()).to.be.properAddress;
      expect(await controller.getAddress()).to.be.properAddress;
      expect(await resolver.getAddress()).to.be.properAddress;
      expect(await priceOracle.getAddress()).to.be.properAddress;
    });

    it("Should have correct ownership setup", async function () {
      expect(await registry.owner(baseNode)).to.equal(await registrar.getAddress());
      expect(await registrar.isController(await controller.getAddress())).to.be.true;
    });
  });

  describe("Pricing", function () {
    it("Should return correct prices for different name lengths", async function () {
      // 3 character name
      const price3 = await priceOracle.price1Year("abc");
      expect(price3).to.equal(ethers.parseEther("0.5")); // 0.5 ETH

      // 4 character name
      const price4 = await priceOracle.price1Year("abcd");
      expect(price4).to.equal(ethers.parseEther("0.05")); // 0.05 ETH

      // 5+ character name
      const price5 = await priceOracle.price1Year("abcde");
      expect(price5).to.equal(ethers.parseEther("0.005")); // 0.005 ETH
    });

    it("Should make short names very expensive", async function () {
      const price1 = await priceOracle.price1Year("a");
      const price2 = await priceOracle.price1Year("ab");

      // Should be max uint256 (impossibly expensive)
      expect(price1).to.equal(ethers.MaxUint256);
      expect(price2).to.equal(ethers.MaxUint256);
    });

    it("Should calculate duration-based pricing correctly", async function () {
      const duration = 365 * 24 * 60 * 60; // 1 year
      const priceData = await priceOracle.price("test", 0, duration);

      expect(priceData.base).to.equal(ethers.parseEther("0.05")); // 4 chars = 0.05 ETH
      expect(priceData.premium).to.equal(0); // No premium
    });
  });

  describe("Name availability and registration", function () {
    const testName = "testname";

    it("Should report names as available initially", async function () {
      expect(await controller.available(testName)).to.be.true;
    });

    it("Should allow commitment and registration flow", async function () {
      const duration = 365 * 24 * 60 * 60; // 1 year
      const secret = ethers.randomBytes(32);

      // Get price
      const priceData = await priceOracle.price(testName, 0, duration);
      const totalPrice = priceData.base + priceData.premium;

      // Make commitment
      const commitment = await controller.makeCommitment(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0
      );

      // Commit
      await controller.commit(commitment);

      // Fast forward time (in tests we can do this)
      await ethers.provider.send("evm_increaseTime", [61]); // 61 seconds
      await ethers.provider.send("evm_mine");

      // Register
      await controller.connect(addr1).register(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0,
        { value: totalPrice }
      );

      // Verify registration
      expect(await controller.available(testName)).to.be.false;

      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(testName));
      const tokenId = ethers.toBigInt(labelHash);
      expect(await registrar.ownerOf(tokenId)).to.equal(addr1.address);
    });

    it("Should reject registration without proper commitment", async function () {
      const duration = 365 * 24 * 60 * 60;
      const secret = ethers.randomBytes(32);
      const priceData = await priceOracle.price(testName, 0, duration);
      const totalPrice = priceData.base + priceData.premium;

      // Try to register without commitment
      await expect(
        controller.connect(addr1).register(
          testName,
          addr1.address,
          duration,
          secret,
          ethers.ZeroAddress,
          [],
          false,
          ethers.ZeroHash,
          0,
          { value: totalPrice }
        )
      ).to.be.reverted;
    });

    it("Should reject registration with insufficient payment", async function () {
      const duration = 365 * 24 * 60 * 60;
      const secret = ethers.randomBytes(32);

      const commitment = await controller.makeCommitment(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0
      );

      await controller.commit(commitment);
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");

      // Try with insufficient payment
      await expect(
        controller.connect(addr1).register(
          testName,
          addr1.address,
          duration,
          secret,
          ethers.ZeroAddress,
          [],
          false,
          ethers.ZeroHash,
          0,
          { value: ethers.parseEther("0.001") } // Too low
        )
      ).to.be.reverted;
    });
  });

  describe("Name expiry and renewal", function () {
    const testName = "renewtest";
    let tokenId;

    beforeEach(async function () {
      // Register a name first
      const duration = 365 * 24 * 60 * 60; // 1 year
      const secret = ethers.randomBytes(32);

      const priceData = await priceOracle.price(testName, 0, duration);
      const totalPrice = priceData.base + priceData.premium;

      const commitment = await controller.makeCommitment(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0
      );

      await controller.commit(commitment);
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");

      await controller.connect(addr1).register(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0,
        { value: totalPrice }
      );

      const labelHash = ethers.keccak256(ethers.toUtf8Bytes(testName));
      tokenId = ethers.toBigInt(labelHash);
    });

    it("Should allow renewal of registered names", async function () {
      const renewalDuration = 365 * 24 * 60 * 60; // 1 year
      const priceData = await priceOracle.price(testName, 0, renewalDuration);
      const renewalPrice = priceData.base + priceData.premium;

      // Get current expiry
      const currentExpiry = await registrar.nameExpires(tokenId);

      // Renew
      await controller.connect(addr1).renew(testName, renewalDuration, ethers.ZeroHash, {
        value: renewalPrice
      });

      // Check new expiry
      const newExpiry = await registrar.nameExpires(tokenId);
      expect(newExpiry).to.be.gt(currentExpiry);
    });

    it("Should allow third party renewal", async function () {
      const renewalDuration = 365 * 24 * 60 * 60;
      const priceData = await priceOracle.price(testName, 0, renewalDuration);
      const renewalPrice = priceData.base + priceData.premium;

      // addr2 renews addr1's domain
      await controller.connect(addr2).renew(testName, renewalDuration, ethers.ZeroHash, {
        value: renewalPrice
      });

      // Domain should still be owned by addr1
      expect(await registrar.ownerOf(tokenId)).to.equal(addr1.address);
    });
  });

  describe("Gas usage estimation", function () {
    it("Should provide gas estimates for key operations", async function () {
      const testName = "gastest";
      const duration = 365 * 24 * 60 * 60;
      const secret = ethers.randomBytes(32);

      const priceData = await priceOracle.price(testName, 0, duration);
      const totalPrice = priceData.base + priceData.premium;

      // Estimate commitment gas
      const commitmentTx = await controller.makeCommitment(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0
      );

      const commitGas = await controller.commit.estimateGas(commitmentTx);
      console.log("      Commit gas estimate:", commitGas.toString());

      // Make commitment for registration test
      await controller.commit(commitmentTx);
      await ethers.provider.send("evm_increaseTime", [61]);
      await ethers.provider.send("evm_mine");

      // Estimate registration gas
      const registerGas = await controller.connect(addr1).register.estimateGas(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0,
        { value: totalPrice }
      );
      console.log("      Register gas estimate:", registerGas.toString());

      // Execute registration for renewal test
      await controller.connect(addr1).register(
        testName,
        addr1.address,
        duration,
        secret,
        ethers.ZeroAddress,
        [],
        false,
        ethers.ZeroHash,
        0,
        { value: totalPrice }
      );

      // Estimate renewal gas
      const renewGas = await controller.connect(addr1).renew.estimateGas(
        testName,
        duration,
        ethers.ZeroHash,
        { value: totalPrice }
      );
      console.log("      Renew gas estimate:", renewGas.toString());

      // All operations should be reasonable gas usage
      expect(commitGas).to.be.lt(100000);
      expect(registerGas).to.be.lt(300000);
      expect(renewGas).to.be.lt(150000);
    });
  });
});
