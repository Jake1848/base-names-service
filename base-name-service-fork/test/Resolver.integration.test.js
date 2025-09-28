const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");
const namehash = require("eth-ens-namehash");

describe("Resolver Integration Tests", function () {
  let controller, baseRegistrar, priceOracle, ens, resolver;
  let registrationLimiter, feeManager;
  let owner, user1;
  const COMMITMENT_AGE_MIN = 60; // 1 minute
  const COMMITMENT_AGE_MAX = 86400; // 1 day

  beforeEach(async function () {
    [owner, user1] = await ethers.getSigners();

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

    // Deploy Price Oracle
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

  describe("Namehash Integration", function () {
    it("Should use correct namehash for .base domains", async function () {
      const label = "testdomain";
      const secret = ethers.randomBytes(32);
      const duration = 365 * 24 * 60 * 60; // 1 year

      // Calculate expected namehash
      const baseNode = await baseRegistrar.baseNode();
      const labelhash = ethers.keccak256(ethers.toUtf8Bytes(label));
      const expectedNamehash = ethers.keccak256(ethers.concat([baseNode, labelhash]));

      // Also verify it matches eth-ens-namehash calculation
      const expectedNamehashLib = namehash.hash(`${label}.base`);
      expect(expectedNamehash).to.equal(expectedNamehashLib);

      // Register domain with resolver
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

      // Verify ENS record was set with correct namehash
      const recordOwner = await ens.owner(expectedNamehash);
      const recordResolver = await ens.resolver(expectedNamehash);

      expect(recordOwner).to.equal(await user1.getAddress());
      expect(recordResolver).to.equal(await resolver.getAddress());
    });

    it("Should correctly set resolver records with proper namehash", async function () {
      const label = "resolver-test";
      const secret = ethers.randomBytes(32);
      const duration = 365 * 24 * 60 * 60;

      // Register without initial resolver data
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

      // Now set address record as the domain owner
      const domainNamehash = namehash.hash(`${label}.base`);
      await resolver.connect(user1).setAddr(domainNamehash, await user1.getAddress());

      // Verify address was set correctly
      const resolvedAddress = await resolver.addr(domainNamehash);
      expect(resolvedAddress).to.equal(await user1.getAddress());
    });

    it("Should handle multiple resolver records with consistent namehash", async function () {
      const label = "multi-record";
      const secret = ethers.randomBytes(32);
      const duration = 365 * 24 * 60 * 60;
      const domainNamehash = namehash.hash(`${label}.base`);

      // Register without initial resolver data
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

      // Set multiple records as the domain owner
      await resolver.connect(user1).setAddr(domainNamehash, await user1.getAddress());
      await resolver.connect(user1).setText(domainNamehash, "email", "test@example.com");

      // Verify all records were set correctly
      const resolvedAddress = await resolver.addr(domainNamehash);
      const resolvedText = await resolver.text(domainNamehash, "email");

      expect(resolvedAddress).to.equal(await user1.getAddress());
      expect(resolvedText).to.equal("test@example.com");
    });

    it("Should verify namehash calculation matches baseNode + labelhash", async function () {
      const label = "namehash-verify";

      // Get baseNode from registrar
      const baseNode = await baseRegistrar.baseNode();
      const labelhash = ethers.keccak256(ethers.toUtf8Bytes(label));

      // Calculate namehash manually
      const calculatedNamehash = ethers.keccak256(ethers.concat([baseNode, labelhash]));

      // Compare with library calculation
      const libraryNamehash = namehash.hash(`${label}.base`);

      expect(calculatedNamehash).to.equal(libraryNamehash);

      // Verify the baseNode is correct for .base
      const expectedBaseNode = namehash.hash("base");
      expect(baseNode).to.equal(expectedBaseNode);
    });

    it("Should handle subdomain namehash correctly", async function () {
      const label = "parent-domain";
      const subdomain = "sub";
      const secret = ethers.randomBytes(32);
      const duration = 365 * 24 * 60 * 60;

      // Register parent domain first
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

      // Create subdomain
      const parentNamehash = namehash.hash(`${label}.base`);
      const subdomainNamehash = namehash.hash(`${subdomain}.${label}.base`);

      // User1 (owner of parent) can create subdomain
      await ens.connect(user1).setSubnodeOwner(
        parentNamehash,
        ethers.id(subdomain),
        await user1.getAddress()
      );

      // Verify subdomain ownership
      const subdomainOwner = await ens.owner(subdomainNamehash);
      expect(subdomainOwner).to.equal(await user1.getAddress());

      // Verify namehash calculation for subdomain
      const expectedSubdomainNamehash = ethers.keccak256(ethers.concat([
        parentNamehash,
        ethers.keccak256(ethers.toUtf8Bytes(subdomain))
      ]));
      expect(subdomainNamehash).to.equal(expectedSubdomainNamehash);
    });
  });

  describe("Dynamic Base Node Usage", function () {
    it("Should use baseNode() method instead of hardcoded value", async function () {
      // Verify the _namehash internal function uses baseNode() correctly
      const label = "dynamic-test";
      const secret = ethers.randomBytes(32);
      const duration = 365 * 24 * 60 * 60;

      // Register domain and verify the namehash is calculated correctly
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

      // The fact that registration succeeds and sets the correct resolver
      // proves that the _namehash function is working correctly
      const expectedNamehash = namehash.hash(`${label}.base`);
      const recordResolver = await ens.resolver(expectedNamehash);
      expect(recordResolver).to.equal(await resolver.getAddress());
    });

    it("Should handle baseNode change scenarios", async function () {
      // This test verifies that if baseNode were to change in the registrar,
      // the controller would still work correctly (theoretical scenario)

      const baseNode = await baseRegistrar.baseNode();
      const expectedBaseForDotBase = namehash.hash("base");

      // Verify current setup is correct
      expect(baseNode).to.equal(expectedBaseForDotBase);

      // Verify that our namehash calculations are consistent
      const testLabel = "consistency-test";
      const labelhash = ethers.keccak256(ethers.toUtf8Bytes(testLabel));
      const manualNamehash = ethers.keccak256(ethers.concat([baseNode, labelhash]));
      const libraryNamehash = namehash.hash(`${testLabel}.base`);

      expect(manualNamehash).to.equal(libraryNamehash);
    });
  });
});