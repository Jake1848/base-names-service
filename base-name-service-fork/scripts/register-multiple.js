// Register multiple .base domains for demonstration
const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("🚀 Registering multiple .base domains...\n");

    // Read deployment info
    const deployment = JSON.parse(fs.readFileSync('deployment-base-sepolia.json', 'utf8'));
    const [deployer] = await ethers.getSigners();

    // Get contracts
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", deployment.contracts.BaseRegistrar);
    const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);
    const resolver = await ethers.getContractAt("PublicResolver", deployment.contracts.PublicResolver);

    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", ethers.formatEther(balance), "ETH");

    // List of domains to register
    const domainsToRegister = [
        "alice", "bob", "charlie", "david", "eve",
        "crypto", "defi", "nft", "web3"
    ];

    const duration = 365 * 24 * 60 * 60; // 1 year
    const registeredDomains = [];

    console.log("📝 Registering domains:");
    console.log("─".repeat(50));

    for (const domainName of domainsToRegister) {
        try {
            const tokenId = ethers.keccak256(ethers.toUtf8Bytes(domainName));

            // Check if already registered
            const isAvailable = await registrar.available(tokenId);

            if (!isAvailable) {
                console.log(`⏭️  ${domainName}.base - Already registered`);
                const owner = await registrar.ownerOf(tokenId);
                registeredDomains.push({
                    name: domainName,
                    owner: owner,
                    status: "pre-existing"
                });
                continue;
            }

            // Register the domain
            console.log(`⏳ Registering ${domainName}.base...`);
            const tx = await registrar.register(tokenId, deployer.address, duration);
            await tx.wait();

            console.log(`✅ ${domainName}.base registered!`);
            registeredDomains.push({
                name: domainName,
                owner: deployer.address,
                status: "newly-registered",
                txHash: tx.hash
            });

            // Small delay to avoid nonce issues
            await new Promise(resolve => setTimeout(resolve, 1000));

        } catch (error) {
            console.log(`❌ Failed to register ${domainName}.base: ${error.message}`);
        }
    }

    // Summary
    console.log("\n📊 Registration Summary:");
    console.log("─".repeat(80));
    console.log(`Total domains processed: ${domainsToRegister.length}`);
    console.log(`Successfully registered: ${registeredDomains.filter(d => d.status === "newly-registered").length}`);
    console.log(`Already existed: ${registeredDomains.filter(d => d.status === "pre-existing").length}`);

    console.log("\n🏷️  Domain Registry:");
    registeredDomains.forEach((domain, index) => {
        console.log(`${index + 1}. ${domain.name}.base`);
        console.log(`   Owner: ${domain.owner}`);
        console.log(`   Status: ${domain.status}`);
        if (domain.txHash) {
            console.log(`   TX: https://sepolia.basescan.org/tx/${domain.txHash}`);
        }
        console.log();
    });

    // Save registry to file
    const registry_data = {
        network: "base-sepolia",
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        total_processed: domainsToRegister.length,
        newly_registered: registeredDomains.filter(d => d.status === "newly-registered").length,
        domains: registeredDomains
    };

    fs.writeFileSync('domain-registry.json', JSON.stringify(registry_data, null, 2));
    console.log("💾 Domain registry saved to domain-registry.json");

    console.log("\n🌐 View Your Domains:");
    console.log("BaseScan:", `https://sepolia.basescan.org/address/${await registrar.getAddress()}`);
    console.log("Registrar Contract:", await registrar.getAddress());
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Error:", error);
        process.exit(1);
    });