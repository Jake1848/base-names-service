// Simple deployment script for Base Sepolia with nonce management
const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');

function labelhash(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
}

// Helper to wait between deployments
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("🚀 Deploying Base Name Service to Base Sepolia...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    let nonce = await deployer.getNonce();
    console.log("Starting nonce:", nonce, "\n");

    // 1. Deploy ENSRegistry
    console.log("1. Deploying ENSRegistry...");
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
    const registry = await ENSRegistry.deploy({ nonce: nonce++ });
    await registry.waitForDeployment();
    console.log("✅ ENSRegistry deployed to:", await registry.getAddress());

    await delay(2000); // Wait 2 seconds

    // 2. Deploy BaseRegistrarImplementation
    console.log("\n2. Deploying BaseRegistrarImplementation...");
    const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
    const baseNode = namehash.hash('base');
    const registrar = await BaseRegistrar.deploy(await registry.getAddress(), baseNode, { nonce: nonce++ });
    await registrar.waitForDeployment();
    console.log("✅ BaseRegistrar deployed to:", await registrar.getAddress());

    await delay(2000);

    // 3. Deploy ReverseRegistrar
    console.log("\n3. Deploying ReverseRegistrar...");
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
    const reverseRegistrar = await ReverseRegistrar.deploy(await registry.getAddress(), { nonce: nonce++ });
    await reverseRegistrar.waitForDeployment();
    console.log("✅ ReverseRegistrar deployed to:", await reverseRegistrar.getAddress());

    await delay(2000);

    // 4. Deploy PublicResolver
    console.log("\n4. Deploying PublicResolver...");
    const PublicResolver = await ethers.getContractFactory("PublicResolver");
    const resolver = await PublicResolver.deploy(
        await registry.getAddress(),
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        await reverseRegistrar.getAddress(),
        { nonce: nonce++ }
    );
    await resolver.waitForDeployment();
    console.log("✅ PublicResolver deployed to:", await resolver.getAddress());

    await delay(2000);

    // 5. Deploy BasePriceOracle
    console.log("\n5. Deploying BasePriceOracle...");
    const BasePriceOracle = await ethers.getContractFactory("BasePriceOracle");
    const priceOracle = await BasePriceOracle.deploy({ nonce: nonce++ });
    await priceOracle.waitForDeployment();
    console.log("✅ BasePriceOracle deployed to:", await priceOracle.getAddress());

    console.log("\n🎉 Core contracts deployed successfully!");
    console.log("\n📋 Contract Addresses:");
    console.log("ENSRegistry:", await registry.getAddress());
    console.log("BaseRegistrar:", await registrar.getAddress());
    console.log("ReverseRegistrar:", await reverseRegistrar.getAddress());
    console.log("PublicResolver:", await resolver.getAddress());
    console.log("BasePriceOracle:", await priceOracle.getAddress());

    // Save deployment info
    const deployment = {
        network: "base-sepolia",
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            ENSRegistry: await registry.getAddress(),
            BaseRegistrar: await registrar.getAddress(),
            ReverseRegistrar: await reverseRegistrar.getAddress(),
            PublicResolver: await resolver.getAddress(),
            BasePriceOracle: await priceOracle.getAddress()
        }
    };

    const fs = require('fs');
    fs.writeFileSync('deployment-base-sepolia.json', JSON.stringify(deployment, null, 2));
    console.log("\n💾 Deployment info saved to deployment-base-sepolia.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });