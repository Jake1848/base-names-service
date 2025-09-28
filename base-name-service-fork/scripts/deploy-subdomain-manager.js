// Deploy SubdomainManager contract
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🏗️  Deploying SubdomainManager...\n");

    // Read deployment info
    const deployment = JSON.parse(fs.readFileSync('deployment-base-sepolia.json', 'utf8'));
    const [deployer] = await ethers.getSigners();

    console.log("👤 Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH\n");

    // Deploy SubdomainManager
    console.log("1. Deploying SubdomainManager...");
    const SubdomainManager = await ethers.getContractFactory("SubdomainManager");
    const subdomainManager = await SubdomainManager.deploy(
        deployment.contracts.ENSRegistry,
        deployment.contracts.BaseRegistrar
    );
    await subdomainManager.waitForDeployment();

    const subdomainManagerAddress = await subdomainManager.getAddress();
    console.log("✅ SubdomainManager deployed to:", subdomainManagerAddress);

    // Update deployment file
    deployment.contracts.SubdomainManager = subdomainManagerAddress;
    deployment.timestamp = new Date().toISOString();

    fs.writeFileSync('deployment-base-sepolia.json', JSON.stringify(deployment, null, 2));
    console.log("💾 Updated deployment file\n");

    // Test subdomain creation
    console.log("2. Testing subdomain creation...");

    // Create a subdomain for alice.base
    const namehash = require('eth-ens-namehash');
    const aliceNode = namehash.hash('alice.base');

    try {
        const tx = await subdomainManager.createSubdomain(
            aliceNode,
            "www",
            deployer.address,
            deployment.contracts.PublicResolver
        );
        await tx.wait();
        console.log("✅ Created www.alice.base subdomain!");
        console.log("   TX:", tx.hash);

        // Verify subdomain exists
        const wwwAliceNode = await subdomainManager.getSubdomainNode(aliceNode, "www");
        const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);
        const subdomainOwner = await registry.owner(wwwAliceNode);
        console.log("   Subdomain owner:", subdomainOwner);

    } catch (error) {
        console.log("❌ Failed to create subdomain:", error.message);
    }

    console.log("\n🎉 SubdomainManager deployment complete!");
    console.log("\n📋 Updated Contract Addresses:");
    Object.entries(deployment.contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });