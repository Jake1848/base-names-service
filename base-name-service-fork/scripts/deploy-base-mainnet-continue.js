// scripts/deploy-base-mainnet-continue.js
const { ethers, network } = require("hardhat");
const namehash = require('eth-ens-namehash');

// Helper function to calculate labelhash
function labelhash(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
}

async function main() {
    console.log("🚀 Continuing Base Name Service Deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Already deployed contracts
    const registryAddress = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
    const registrarAddress = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";

    console.log("Using existing contracts:");
    console.log("  ENSRegistry:", registryAddress);
    console.log("  BaseRegistrar:", registrarAddress);
    console.log("");

    // Get existing contract instances
    const registry = await ethers.getContractAt("ENSRegistry", registryAddress);
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", registrarAddress);

    // 3. Deploy ReverseRegistrar (for reverse resolution)
    console.log("3. Deploying ReverseRegistrar...");
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
    const reverseRegistrar = await ReverseRegistrar.deploy(registryAddress);
    await reverseRegistrar.waitForDeployment();
    console.log("✅ ReverseRegistrar deployed to:", await reverseRegistrar.getAddress());

    // 4. Deploy PublicResolver
    console.log("\n4. Deploying PublicResolver...");
    const PublicResolver = await ethers.getContractFactory("PublicResolver");
    const resolver = await PublicResolver.deploy(
        registryAddress,
        ethers.ZeroAddress, // No wrapper for now
        ethers.ZeroAddress, // No controller
        await reverseRegistrar.getAddress()
    );
    await resolver.waitForDeployment();
    console.log("✅ PublicResolver deployed to:", await resolver.getAddress());

    // 5. Deploy Price Oracle (custom Base pricing)
    console.log("\n5. Deploying BasePriceOracle...");
    const BasePriceOracle = await ethers.getContractFactory("BasePriceOracle");
    const priceOracle = await BasePriceOracle.deploy();
    await priceOracle.waitForDeployment();
    console.log("✅ BasePriceOracle deployed to:", await priceOracle.getAddress());

    // 6. Deploy RegistrationLimiter (rate limiting)
    console.log("\n6. Deploying RegistrationLimiter...");
    const RegistrationLimiter = await ethers.getContractFactory("RegistrationLimiter");
    const registrationLimiter = await RegistrationLimiter.deploy();
    await registrationLimiter.waitForDeployment();
    console.log("✅ RegistrationLimiter deployed to:", await registrationLimiter.getAddress());

    // 7. Deploy FeeManager (treasury management)
    console.log("\n7. Deploying FeeManager...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy(deployer.address);
    await feeManager.waitForDeployment();
    console.log("✅ FeeManager deployed to:", await feeManager.getAddress());

    // 8. Deploy DefaultReverseRegistrar
    console.log("\n8. Deploying DefaultReverseRegistrar...");
    const DefaultReverseRegistrar = await ethers.getContractFactory("DefaultReverseRegistrar");
    const defaultReverseRegistrar = await DefaultReverseRegistrar.deploy(registryAddress);
    await defaultReverseRegistrar.waitForDeployment();
    console.log("✅ DefaultReverseRegistrar deployed to:", await defaultReverseRegistrar.getAddress());

    // 9. Deploy BaseRegistrarController (handles registrations)
    console.log("\n9. Deploying BaseRegistrarController...");
    const BaseController = await ethers.getContractFactory("ETHRegistrarController");
    const minCommitmentAge = 60; // 60 seconds
    const maxCommitmentAge = 86400; // 24 hours

    const controller = await BaseController.deploy(
        registrarAddress,
        await priceOracle.getAddress(),
        minCommitmentAge,
        maxCommitmentAge,
        await reverseRegistrar.getAddress(),
        await defaultReverseRegistrar.getAddress(),
        registryAddress,
        await registrationLimiter.getAddress(),
        await feeManager.getAddress()
    );
    await controller.waitForDeployment();
    console.log("✅ BaseRegistrarController deployed to:", await controller.getAddress());

    // Now set up the permissions and ownership

    console.log("\n10. Setting up permissions...");

    const baseNode = namehash.hash('base');

    // Give the registrar ownership of the 'base' node
    console.log("   - Setting up .base TLD ownership...");
    await registry.setSubnodeOwner(
        '0x0000000000000000000000000000000000000000000000000000000000000000', // root node
        labelhash('base'),
        registrarAddress
    );

    // Add controller to registrar
    console.log("   - Adding controller to registrar...");
    await registrar.addController(await controller.getAddress());

    // Authorize controller in registration limiter
    console.log("   - Authorizing controller in RegistrationLimiter...");
    await registrationLimiter.setController(await controller.getAddress());

    // Set up reverse registrar
    console.log("   - Setting up reverse resolution...");
    await registry.setSubnodeOwner(
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        labelhash('reverse'),
        deployer.address
    );
    await registry.setSubnodeOwner(
        namehash.hash('reverse'),
        labelhash('addr'),
        await reverseRegistrar.getAddress()
    );

    // Set resolver for reverse
    await reverseRegistrar.setDefaultResolver(await resolver.getAddress());

    console.log("✅ Permissions configured!\n");

    // Save deployment info
    const contracts = {
        ENSRegistry: registryAddress,
        BaseRegistrar: registrarAddress,
        BaseController: await controller.getAddress(),
        PublicResolver: await resolver.getAddress(),
        ReverseRegistrar: await reverseRegistrar.getAddress(),
        DefaultReverseRegistrar: await defaultReverseRegistrar.getAddress(),
        BasePriceOracle: await priceOracle.getAddress(),
        RegistrationLimiter: await registrationLimiter.getAddress(),
        FeeManager: await feeManager.getAddress(),
    };

    console.log("========================================");
    console.log("🎉 BASE NAME SERVICE DEPLOYED!");
    console.log("========================================");
    console.log("Network:", network.name);
    console.log("Contracts:");
    Object.entries(contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });
    console.log("========================================");

    // Save to file
    const fs = require("fs");
    const deploymentInfo = {
        network: network.name,
        deployer: deployer.address,
        contracts,
        timestamp: new Date().toISOString(),
    };

    fs.writeFileSync(
        `deployment-${network.name}.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`\n📁 Deployment info saved to deployment-${network.name}.json`);

    console.log("\n✨ Deployment complete! You can now register .base domains!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });