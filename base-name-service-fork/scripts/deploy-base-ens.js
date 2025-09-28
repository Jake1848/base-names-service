// scripts/deploy-base-ens.js
const { ethers, network } = require("hardhat");
const namehash = require('eth-ens-namehash');

// Helper function to calculate labelhash
function labelhash(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
}

async function main() {
    console.log("🚀 Deploying Base Name Service (Forked from ENS)...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy order matters! Dependencies first.

    // 1. Deploy ENSRegistry
    console.log("1. Deploying ENSRegistry...");
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
    const registry = await ENSRegistry.deploy();
    await registry.waitForDeployment();
    console.log("✅ ENSRegistry deployed to:", await registry.getAddress());

    // 2. Deploy BaseRegistrarImplementation (manages .base TLD)
    console.log("\n2. Deploying BaseRegistrarImplementation...");
    const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
    const baseNode = namehash.hash('base'); // namehash of 'base'
    const registrar = await BaseRegistrar.deploy(await registry.getAddress(), baseNode);
    await registrar.waitForDeployment();
    console.log("✅ BaseRegistrar deployed to:", await registrar.getAddress());

    // 3. Deploy ReverseRegistrar (for reverse resolution)
    console.log("\n3. Deploying ReverseRegistrar...");
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
    const reverseRegistrar = await ReverseRegistrar.deploy(await registry.getAddress());
    await reverseRegistrar.waitForDeployment();
    console.log("✅ ReverseRegistrar deployed to:", await reverseRegistrar.getAddress());

    // 4. Deploy PublicResolver
    console.log("\n4. Deploying PublicResolver...");
    const PublicResolver = await ethers.getContractFactory("PublicResolver");
    const resolver = await PublicResolver.deploy(
        await registry.getAddress(),
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
    const defaultReverseRegistrar = await DefaultReverseRegistrar.deploy(await registry.getAddress());
    await defaultReverseRegistrar.waitForDeployment();
    console.log("✅ DefaultReverseRegistrar deployed to:", await defaultReverseRegistrar.getAddress());

    // 9. Deploy BaseRegistrarController (handles registrations)
    console.log("\n9. Deploying BaseRegistrarController...");
    const BaseController = await ethers.getContractFactory("ETHRegistrarController");
    const minCommitmentAge = 60; // 60 seconds
    const maxCommitmentAge = 86400; // 24 hours

    const controller = await BaseController.deploy(
        await registrar.getAddress(),
        await priceOracle.getAddress(),
        minCommitmentAge,
        maxCommitmentAge,
        await reverseRegistrar.getAddress(),
        await defaultReverseRegistrar.getAddress(),
        await registry.getAddress(),
        await registrationLimiter.getAddress(),
        await feeManager.getAddress()
    );
    await controller.waitForDeployment();
    console.log("✅ BaseRegistrarController deployed to:", await controller.getAddress());

    // Now set up the permissions and ownership

    console.log("\n7. Setting up permissions...");

    // Give the registrar ownership of the 'base' node
    console.log("   - Setting up .base TLD ownership...");
    await registry.setSubnodeOwner(
        '0x0000000000000000000000000000000000000000000000000000000000000000', // root node
        labelhash('base'),
        await registrar.getAddress()
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
        ENSRegistry: await registry.getAddress(),
        BaseRegistrar: await registrar.getAddress(),
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

    // Verify contracts on BaseScan (if not local)
    if (network.name !== "localhost" && network.name !== "hardhat") {
        console.log("\n⏳ Waiting for blocks before verification...");
        await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

        console.log("\n📝 Verifying contracts on BaseScan...");

        try {
            await hre.run("verify:verify", {
                address: await registry.getAddress(),
                constructorArguments: [],
            });

            await hre.run("verify:verify", {
                address: await registrar.getAddress(),
                constructorArguments: [await registry.getAddress(), baseNode],
            });

            await hre.run("verify:verify", {
                address: await priceOracle.getAddress(),
                constructorArguments: [],
            });

            await hre.run("verify:verify", {
                address: await controller.getAddress(),
                constructorArguments: [
                    await registrar.getAddress(),
                    await priceOracle.getAddress(),
                    minCommitmentAge,
                    maxCommitmentAge,
                    await reverseRegistrar.getAddress(),
                    await defaultReverseRegistrar.getAddress(),
                    await registry.getAddress(),
                    await registrationLimiter.getAddress(),
                    await feeManager.getAddress()
                ],
            });

            console.log("✅ Contracts verified!");
        } catch (error) {
            console.log("⚠️ Verification failed:", error.message);
        }
    }

    console.log("\n✨ Deployment complete! You can now register .base domains!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
