// Setup the .base domain registration system
const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');
const fs = require('fs');

async function main() {
    console.log("🔧 Setting up .base domain registration...\n");

    // Read deployment info
    const deployment = JSON.parse(fs.readFileSync('deployment-base-sepolia.json', 'utf8'));
    const [deployer] = await ethers.getSigners();

    console.log("👤 Setting up with account:", deployer.address);

    // Get contracts
    const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", deployment.contracts.BaseRegistrar);
    const resolver = await ethers.getContractAt("PublicResolver", deployment.contracts.PublicResolver);

    // 1. Set up the .base TLD in the registry
    console.log("1. Setting up .base TLD...");
    const baseNode = namehash.hash('base');
    console.log("Base node hash:", baseNode);

    // Check if .base is already owned
    const baseOwner = await registry.owner(baseNode);
    console.log("Current .base owner:", baseOwner);

    if (baseOwner === ethers.ZeroAddress) {
        console.log("Setting .base owner to registrar...");
        const tx1 = await registry.setSubnodeOwner(
            "0x" + "0".repeat(64), // root node
            ethers.keccak256(ethers.toUtf8Bytes('base')), // 'base' label
            await registrar.getAddress()
        );
        await tx1.wait();
        console.log("✅ .base TLD configured");
    } else {
        console.log("✅ .base TLD already configured");
    }

    // 2. Check registrar configuration
    console.log("\n2. Checking registrar configuration...");
    const registrarBase = await registrar.baseNode();
    console.log("Registrar base node:", registrarBase);
    console.log("Expected base node:", baseNode);
    console.log("Base node match:", registrarBase === baseNode);

    // 3. Set resolver for .base
    console.log("\n3. Setting resolver for .base...");
    const currentResolver = await registry.resolver(baseNode);
    console.log("Current .base resolver:", currentResolver);

    if (currentResolver === ethers.ZeroAddress) {
        const tx2 = await registry.setResolver(baseNode, await resolver.getAddress());
        await tx2.wait();
        console.log("✅ Resolver set for .base");
    } else {
        console.log("✅ Resolver already set for .base");
    }

    console.log("\n🎉 .base domain setup complete!");
    console.log("Ready to register .base domains!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Setup failed:", error);
        process.exit(1);
    });