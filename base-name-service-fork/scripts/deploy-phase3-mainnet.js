const { ethers } = require("hardhat");
const fs = require('fs');

async function main() {
    console.log("\n🚀 Deploying Phase 3 Contracts to Base Mainnet...\n");

    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Deployer:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH\n");

    if (balance < ethers.parseEther("0.02")) {
        console.error("❌ Insufficient balance! Need at least 0.02 ETH");
        console.error("Current balance:", ethers.formatEther(balance), "ETH");
        process.exit(1);
    }

    // Load existing core contracts
    const coreContracts = {
        BaseRegistrar: "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917"
    };

    const deployedContracts = {};

    // 1. Deploy DomainMarketplace
    console.log("📦 Deploying DomainMarketplace...");
    const DomainMarketplace = await ethers.getContractFactory("DomainMarketplace");
    const marketplace = await DomainMarketplace.deploy(coreContracts.BaseRegistrar);
    await marketplace.waitForDeployment();
    const marketplaceAddress = await marketplace.getAddress();
    deployedContracts.DomainMarketplace = marketplaceAddress;
    console.log("✅ DomainMarketplace:", marketplaceAddress);

    // 2. Deploy DomainStaking
    console.log("\n📦 Deploying DomainStaking...");
    const DomainStaking = await ethers.getContractFactory("DomainStaking");
    const staking = await DomainStaking.deploy(coreContracts.BaseRegistrar);
    await staking.waitForDeployment();
    const stakingAddress = await staking.getAddress();
    deployedContracts.DomainStaking = stakingAddress;
    console.log("✅ DomainStaking:", stakingAddress);

    // 3. Deploy CrossChainBridge
    console.log("\n📦 Deploying CrossChainBridge...");
    const CrossChainBridge = await ethers.getContractFactory("BaseNamesCrossChainBridge");
    const bridge = await CrossChainBridge.deploy(deployer.address); // deployer as validator
    await bridge.waitForDeployment();
    const bridgeAddress = await bridge.getAddress();
    deployedContracts.CrossChainBridge = bridgeAddress;
    console.log("✅ CrossChainBridge:", bridgeAddress);

    // Save deployment addresses
    const deploymentData = {
        network: "base-mainnet",
        chainId: 8453,
        timestamp: new Date().toISOString(),
        deployer: deployer.address,
        contracts: {
            ...coreContracts,
            ...deployedContracts
        }
    };

    fs.writeFileSync(
        'phase3-deployment-mainnet.json',
        JSON.stringify(deploymentData, null, 2)
    );

    console.log("\n✅ Phase 3 Deployment Complete!");
    console.log("\n📋 Deployed Contracts:");
    console.log(JSON.stringify(deployedContracts, null, 2));
    console.log("\n💾 Saved to: phase3-deployment-mainnet.json");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
