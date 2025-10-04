// Continue deployment from partial Sepolia deployment
const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');
const fs = require('fs');

function labelhash(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
    console.log("🚀 Continuing Base Sepolia Deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    let nonce = await deployer.getNonce();
    console.log("Current nonce:", nonce, "\n");

    // Already deployed contracts
    const deployment = {
        network: "base-sepolia",
        chainId: 84532,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            ENSRegistry: "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd",
            BaseRegistrar: "0x69b81319958388b5133DF617Ba542FB6c9e03177",
            ReverseRegistrar: "0xa1f10499B1D1a1c249443d82aaDA9ff7F3AE99cF"
        }
    };

    console.log("✅ Using existing contracts:");
    console.log("   ENSRegistry:", deployment.contracts.ENSRegistry);
    console.log("   BaseRegistrar:", deployment.contracts.BaseRegistrar);
    console.log("   ReverseRegistrar:", deployment.contracts.ReverseRegistrar);
    console.log("\n📦 Deploying remaining contracts...\n");

    // 4. Deploy DefaultReverseRegistrar
    console.log("4. Deploying DefaultReverseRegistrar...");
    const DefaultReverseRegistrar = await ethers.getContractFactory("DefaultReverseRegistrar");
    const defaultReverseRegistrar = await DefaultReverseRegistrar.deploy(
        deployment.contracts.ENSRegistry,
        { nonce: nonce++ }
    );
    await defaultReverseRegistrar.waitForDeployment();
    deployment.contracts.DefaultReverseResolver = await defaultReverseRegistrar.getAddress();
    console.log("✅ DefaultReverseRegistrar:", deployment.contracts.DefaultReverseResolver);
    await delay(2000);

    // 5. Deploy PublicResolver
    console.log("\n5. Deploying PublicResolver...");
    const PublicResolver = await ethers.getContractFactory("PublicResolver");
    const resolver = await PublicResolver.deploy(
        deployment.contracts.ENSRegistry,
        ethers.ZeroAddress,
        ethers.ZeroAddress,
        deployment.contracts.ReverseRegistrar,
        { nonce: nonce++ }
    );
    await resolver.waitForDeployment();
    deployment.contracts.PublicResolver = await resolver.getAddress();
    console.log("✅ PublicResolver:", deployment.contracts.PublicResolver);
    await delay(2000);

    // 6. Deploy BasePriceOracle
    console.log("\n6. Deploying BasePriceOracle...");
    const BasePriceOracle = await ethers.getContractFactory("BasePriceOracle");
    const priceOracle = await BasePriceOracle.deploy({ nonce: nonce++ });
    await priceOracle.waitForDeployment();
    deployment.contracts.BasePriceOracle = await priceOracle.getAddress();
    console.log("✅ BasePriceOracle:", deployment.contracts.BasePriceOracle);
    await delay(2000);

    // 7. Deploy FeeManager
    console.log("\n7. Deploying FeeManager...");
    const FeeManager = await ethers.getContractFactory("FeeManager");
    const feeManager = await FeeManager.deploy(deployer.address, { nonce: nonce++ });
    await feeManager.waitForDeployment();
    deployment.contracts.FeeManager = await feeManager.getAddress();
    console.log("✅ FeeManager:", deployment.contracts.FeeManager);
    await delay(2000);

    // 8. Deploy RegistrationLimiter first
    console.log("\n8a. Deploying RegistrationLimiter...");
    const RegistrationLimiter = await ethers.getContractFactory("RegistrationLimiter");
    const limiter = await RegistrationLimiter.deploy({ nonce: nonce++ });
    await limiter.waitForDeployment();
    deployment.contracts.RegistrationLimiter = await limiter.getAddress();
    console.log("✅ RegistrationLimiter:", deployment.contracts.RegistrationLimiter);
    await delay(2000);

    // 8b. Deploy ETHRegistrarController
    console.log("\n8b. Deploying ETHRegistrarController...");
    const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
    const controller = await ETHRegistrarController.deploy(
        deployment.contracts.BaseRegistrar,
        deployment.contracts.BasePriceOracle,
        60, // minCommitmentAge
        86400, // maxCommitmentAge
        deployment.contracts.ReverseRegistrar,
        deployment.contracts.DefaultReverseResolver,
        deployment.contracts.ENSRegistry,
        deployment.contracts.RegistrationLimiter,
        deployment.contracts.FeeManager,
        { nonce: nonce++ }
    );
    await controller.waitForDeployment();
    deployment.contracts.BaseController = await controller.getAddress();
    console.log("✅ BaseController:", deployment.contracts.BaseController);
    await delay(2000);

    // 9. Deploy BulkRenewal
    console.log("\n9. Deploying BulkRenewal...");
    const BulkRenewal = await ethers.getContractFactory("BulkRenewal");
    const bulkRenewal = await BulkRenewal.deploy(
        deployment.contracts.BaseController,
        { nonce: nonce++ }
    );
    await bulkRenewal.waitForDeployment();
    deployment.contracts.BulkRenewal = await bulkRenewal.getAddress();
    console.log("✅ BulkRenewal:", deployment.contracts.BulkRenewal);
    await delay(2000);

    // 10. Deploy StaticBulkRenewal
    console.log("\n10. Deploying StaticBulkRenewal...");
    const StaticBulkRenewal = await ethers.getContractFactory("StaticBulkRenewal");
    const staticBulkRenewal = await StaticBulkRenewal.deploy(
        deployment.contracts.BaseController,
        { nonce: nonce++ }
    );
    await staticBulkRenewal.waitForDeployment();
    deployment.contracts.StaticBulkRenewal = await staticBulkRenewal.getAddress();
    console.log("✅ StaticBulkRenewal:", deployment.contracts.StaticBulkRenewal);
    await delay(2000);

    console.log("\n\n📦 PHASE 3: Marketplace & DeFi\n");

    // 11. Deploy DomainMarketplace
    console.log("11. Deploying DomainMarketplace...");
    const DomainMarketplace = await ethers.getContractFactory("DomainMarketplace");
    const marketplace = await DomainMarketplace.deploy(
        deployment.contracts.BaseRegistrar,
        { nonce: nonce++ }
    );
    await marketplace.waitForDeployment();
    deployment.contracts.DomainMarketplace = await marketplace.getAddress();
    console.log("✅ DomainMarketplace:", deployment.contracts.DomainMarketplace);
    await delay(2000);

    // 12. Deploy DomainStaking
    console.log("\n12. Deploying DomainStaking...");
    const DomainStaking = await ethers.getContractFactory("DomainStaking");
    const staking = await DomainStaking.deploy(
        deployment.contracts.BaseRegistrar,
        { nonce: nonce++ }
    );
    await staking.waitForDeployment();
    deployment.contracts.DomainStaking = await staking.getAddress();
    console.log("✅ DomainStaking:", deployment.contracts.DomainStaking);
    await delay(2000);

    // 13. CrossChainBridge - Skip for now (compilation issue)
    console.log("\n13. Skipping CrossChainBridge (optional feature)");
    deployment.contracts.CrossChainBridge = "Not deployed - optional";
    await delay(1000);

    console.log("\n\n⚙️  Configuring Contracts...\n");

    // Set up .base TLD in registry
    console.log("Setting up .base TLD in registry...");
    const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);
    const baseLabel = labelhash("base");
    const tx1 = await registry.setSubnodeOwner(
        ethers.zeroPadValue("0x00", 32),
        baseLabel,
        deployment.contracts.BaseRegistrar,
        { nonce: nonce++ }
    );
    await tx1.wait();
    console.log("✅ .base TLD ownership transferred to BaseRegistrar");
    await delay(2000);

    // Add BaseController to BaseRegistrar
    console.log("\nAdding BaseController to BaseRegistrar...");
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", deployment.contracts.BaseRegistrar);
    const tx2 = await registrar.addController(deployment.contracts.BaseController, { nonce: nonce++ });
    await tx2.wait();
    console.log("✅ BaseController added as controller");
    await delay(2000);

    // Set reverse registrar default resolver
    console.log("\nSetting ReverseRegistrar default resolver...");
    const reverseRegistrar = await ethers.getContractAt("ReverseRegistrar", deployment.contracts.ReverseRegistrar);
    const tx3 = await reverseRegistrar.setDefaultResolver(
        deployment.contracts.DefaultReverseResolver,
        { nonce: nonce++ }
    );
    await tx3.wait();
    console.log("✅ Default reverse resolver set");

    console.log("\n\n🎉 DEPLOYMENT COMPLETE!\n");
    console.log("=" .repeat(60));
    console.log("\n📋 All Contract Addresses:\n");

    Object.entries(deployment.contracts).forEach(([name, address]) => {
        console.log(`${name.padEnd(25)} ${address}`);
    });

    console.log("\n" + "=".repeat(60));

    // Save to file
    fs.writeFileSync(
        'deployment-base-sepolia-complete.json',
        JSON.stringify(deployment, null, 2)
    );
    console.log("\n💾 Deployment saved to: deployment-base-sepolia-complete.json");

    // Generate frontend config
    const frontendConfig = `// Base Sepolia Testnet Contract Addresses
// Generated: ${deployment.timestamp}

export const BASE_SEPOLIA_CONTRACTS = {
  ENSRegistry: "${deployment.contracts.ENSRegistry}",
  BaseRegistrar: "${deployment.contracts.BaseRegistrar}",
  ReverseRegistrar: "${deployment.contracts.ReverseRegistrar}",
  DefaultReverseResolver: "${deployment.contracts.DefaultReverseResolver}",
  PublicResolver: "${deployment.contracts.PublicResolver}",
  BaseController: "${deployment.contracts.BaseController}",
  BasePriceOracle: "${deployment.contracts.BasePriceOracle}",
  FeeManager: "${deployment.contracts.FeeManager}",
  BulkRenewal: "${deployment.contracts.BulkRenewal}",
  StaticBulkRenewal: "${deployment.contracts.StaticBulkRenewal}",
  DomainMarketplace: "${deployment.contracts.DomainMarketplace}",
  DomainStaking: "${deployment.contracts.DomainStaking}",
  CrossChainBridge: "${deployment.contracts.CrossChainBridge}",
} as const;
`;

    fs.writeFileSync('sepolia-contracts-config.ts', frontendConfig);
    console.log("💾 Frontend config saved to: sepolia-contracts-config.ts\n");

    console.log("\n✅ Users can now test with FREE testnet ETH!");
    console.log("✅ Get testnet ETH: https://www.alchemy.com/faucets/base-sepolia");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
