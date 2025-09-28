// List all registered .base domains
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("📋 Listing all registered .base domains...\n");

    // Read deployment info
    const deployment = JSON.parse(fs.readFileSync('deployment-base-sepolia.json', 'utf8'));

    // Get contracts
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", deployment.contracts.BaseRegistrar);
    const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);

    console.log("📊 Contract Info:");
    console.log("Registrar:", await registrar.getAddress());
    console.log("Network:", "Base Sepolia");

    // Get total supply of registered domains
    try {
        const totalSupply = await registrar.totalSupply();
        console.log("\n🔢 Total registered domains:", totalSupply.toString());

        if (totalSupply > 0) {
            console.log("\n📝 Registered Domains:");
            console.log("─".repeat(80));

            // Get domain details for each registered domain
            for (let i = 0; i < Number(totalSupply); i++) {
                try {
                    const tokenId = await registrar.tokenByIndex(i);
                    const owner = await registrar.ownerOf(tokenId);
                    const expires = await registrar.nameExpires(tokenId);

                    // Try to get domain name (this is tricky since we only have tokenId)
                    console.log(`Domain #${i + 1}:`);
                    console.log(`  Token ID: ${tokenId}`);
                    console.log(`  Owner: ${owner}`);
                    console.log(`  Expires: ${new Date(Number(expires) * 1000).toISOString()}`);
                    console.log(`  View on BaseScan: https://sepolia.basescan.org/token/${await registrar.getAddress()}?a=${tokenId}`);
                    console.log();
                } catch (error) {
                    console.log(`  Error getting domain #${i}: ${error.message}`);
                }
            }
        }

        // Check our test domain specifically
        console.log("\n🧪 Test Domain Check:");
        const testName = "testdomain";
        const tokenId = ethers.keccak256(ethers.toUtf8Bytes(testName));

        try {
            const isAvailable = await registrar.available(tokenId);
            if (!isAvailable) {
                const owner = await registrar.ownerOf(tokenId);
                const expires = await registrar.nameExpires(tokenId);
                console.log(`✅ ${testName}.base is registered!`);
                console.log(`   Owner: ${owner}`);
                console.log(`   Expires: ${new Date(Number(expires) * 1000).toISOString()}`);
            } else {
                console.log(`❌ ${testName}.base is not registered`);
            }
        } catch (error) {
            console.log(`Error checking ${testName}.base: ${error.message}`);
        }

        // Suggest domain creation plan
        console.log("\n🎯 Domain Creation Strategy:");
        console.log("Current registered: " + totalSupply.toString());
        console.log("\nSuggested domains to register:");
        const suggestedDomains = [
            "alice", "bob", "charlie", "david", "eve",
            "crypto", "defi", "nft", "web3", "base",
            "ethereum", "blockchain", "smart", "contract", "dapp"
        ];

        console.log("Short/Premium domains:", suggestedDomains.slice(0, 10).join(", "));
        console.log("Tech domains:", suggestedDomains.slice(10).join(", "));
        console.log("\nTotal suggested: 15 domains");
        console.log("Estimated cost: 15 × 0.05 ETH = 0.75 ETH");

    } catch (error) {
        console.log("❌ Error accessing totalSupply:", error.message);
        console.log("The contract might not support enumeration, but registration still works!");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });