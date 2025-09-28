// Test registering a .base domain
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🏷️  Testing .base domain registration...\n");

    // Read deployment info
    const deployment = JSON.parse(fs.readFileSync('deployment-base-sepolia.json', 'utf8'));
    const [deployer] = await ethers.getSigners();

    console.log("👤 Registering with account:", deployer.address);

    // Get contracts
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", deployment.contracts.BaseRegistrar);
    const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);

    // Test domain name
    const testName = "testdomain";
    const tokenId = ethers.keccak256(ethers.toUtf8Bytes(testName));

    console.log("Testing domain:", testName + ".base");
    console.log("Token ID:", tokenId);

    // 1. Check if domain is available
    console.log("\n1. Checking domain availability...");
    const isAvailable = await registrar.available(tokenId);
    console.log("Domain available:", isAvailable);

    if (!isAvailable) {
        console.log("Domain already registered, checking owner...");
        try {
            const owner = await registrar.ownerOf(tokenId);
            console.log("Current owner:", owner);
        } catch (e) {
            console.log("Error getting owner:", e.message);
        }
        return;
    }

    // 2. Check registrar owns .base
    const namehash = require('eth-ens-namehash');
    const baseNode = namehash.hash('base');
    const baseOwner = await registry.owner(baseNode);
    console.log("\n2. Checking .base ownership...");
    console.log("Base owner:", baseOwner);
    console.log("Registrar address:", await registrar.getAddress());
    console.log("Registrar owns .base:", baseOwner.toLowerCase() === (await registrar.getAddress()).toLowerCase());

    // 3. Try to register the domain directly (simple test)
    console.log("\n3. Attempting direct registration...");
    const duration = 365 * 24 * 60 * 60; // 1 year in seconds

    try {
        const tx = await registrar.register(tokenId, deployer.address, duration);
        await tx.wait();
        console.log("✅ Domain registered successfully!");

        // Verify registration
        const owner = await registrar.ownerOf(tokenId);
        const expires = await registrar.nameExpires(tokenId);
        console.log("Owner:", owner);
        console.log("Expires:", new Date(Number(expires) * 1000).toISOString());

    } catch (error) {
        console.log("❌ Registration failed:", error.message);

        // Check if it's a controller issue
        console.log("\n4. Checking controller status...");
        const isController = await registrar.controllers(deployer.address);
        console.log("Is deployer a controller:", isController);

        if (!isController) {
            console.log("Adding deployer as controller...");
            const tx2 = await registrar.addController(deployer.address);
            await tx2.wait();
            console.log("✅ Controller added, try registration again");

            // Retry registration
            const tx3 = await registrar.register(tokenId, deployer.address, duration);
            await tx3.wait();
            console.log("✅ Domain registered after adding controller!");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Test failed:", error);
        process.exit(1);
    });