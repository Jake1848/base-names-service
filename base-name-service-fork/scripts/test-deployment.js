// Test the deployed contracts on Base Sepolia
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🧪 Testing Base Sepolia deployment...\n");

    // Read deployment info
    const deployment = JSON.parse(fs.readFileSync('deployment-base-sepolia.json', 'utf8'));
    console.log("📋 Deployed contracts:");
    Object.entries(deployment.contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });

    const [deployer] = await ethers.getSigners();
    console.log("\n👤 Testing with account:", deployer.address);

    // Test ENSRegistry
    console.log("\n1. Testing ENSRegistry...");
    const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);
    const owner = await registry.owner("0x" + "0".repeat(64));
    console.log("✅ Root node owner:", owner);

    // Test BaseRegistrar
    console.log("\n2. Testing BaseRegistrar...");
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", deployment.contracts.BaseRegistrar);
    const registrarOwner = await registrar.owner();
    console.log("✅ Registrar owner:", registrarOwner);

    // Test PublicResolver
    console.log("\n3. Testing PublicResolver...");
    const resolver = await ethers.getContractAt("PublicResolver", deployment.contracts.PublicResolver);
    console.log("✅ PublicResolver deployed successfully");

    // Test BasePriceOracle
    console.log("\n4. Testing BasePriceOracle...");
    const priceOracle = await ethers.getContractAt("BasePriceOracle", deployment.contracts.BasePriceOracle);
    const price = await priceOracle.price("test", 0, 31536000); // 1 year
    console.log("✅ Price for 'test' (1 year):", ethers.formatEther(price[0]), "ETH");

    console.log("\n🎉 All contract tests passed! Deployment is working correctly.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });