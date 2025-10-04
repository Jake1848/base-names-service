// Complete deployment script for Base Sepolia testnet
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
    console.log("🚀 Deploying COMPLETE Base Name Service to Base Sepolia...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    if (balance < ethers.parseEther("0.03")) {
        console.error("❌ Insufficient balance! Need at least 0.03 testnet ETH");
        console.log("\n💡 Get free testnet ETH from:");
        console.log("   - https://www.alchemy.com/faucets/base-sepolia");
        console.log("   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
        process.exit(1);
    }

    let nonce = await deployer.getNonce();
    console.log("Starting nonce:", nonce, "\n");

    const deployment = {
        network: "base-sepolia",
        chainId: 84532,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {}
    };

    // ============================================
    // PHASE 1: CORE ENS INFRASTRUCTURE
    // ============================================

    console.log("📦 PHASE 1: Core ENS Infrastructure\n");

    // 1. Deploy ENSRegistry
    console.log("1. Deploying ENSRegistry...");
    const ENSRegistry = await ethers.getContractFactory("ENSRegistry");
    const registry = await ENSRegistry.deploy({ nonce: nonce++ });
    await registry.waitForDeployment();
    deployment.contracts.ENSRegistry = await registry.getAddress();
    console.log("✅ ENSRegistry:", deployment.contracts.ENSRegistry);
    await delay(2000);

    // 2. Deploy BaseRegistrarImplementation
    console.log("\n2. Deploying BaseRegistrarImplementation...");
    const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
    const baseNode = namehash.hash('base');
    const registrar = await BaseRegistrar.deploy(
        deployment.contracts.ENSRegistry,
        baseNode,
        { nonce: nonce++ }
    );
    await registrar.waitForDeployment();
    deployment.contracts.BaseRegistrar = await registrar.getAddress();
    console.log("✅ BaseRegistrar:", deployment.contracts.BaseRegistrar);
    await delay(2000);

    // 3. Deploy ReverseRegistrar
    console.log("\n3. Deploying ReverseRegistrar...");
    const ReverseRegistrar = await ethers.getContractFactory("ReverseRegistrar");
    const reverseRegistrar = await ReverseRegistrar.deploy(
        deployment.contracts.ENSRegistry,
        { nonce: nonce++ }
    );
    await reverseRegistrar.waitForDeployment();
    deployment.contracts.ReverseRegistrar = await reverseRegistrar.getAddress();
    console.log("✅ ReverseRegistrar:", deployment.contracts.ReverseRegistrar);
    await delay(2000);

    // 4. Deploy DefaultReverseRegistrar
    console.log("\n4. Deploying DefaultReverseRegistrar...");
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

    // ============================================
    // PHASE 2: PRICING & CONTROLLER
    // ============================================

    console.log("\n\n📦 PHASE 2: Pricing & Controller\n");

    // 6. Deploy BasePriceOracle
    console.log("6. Deploying BasePriceOracle...");
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

    // 8. Deploy ETHRegistrarController
    console.log("\n8. Deploying ETHRegistrarController...");
    const ETHRegistrarController = await ethers.getContractFactory("ETHRegistrarController");
    const controller = await ETHRegistrarController.deploy(
        deployment.contracts.BaseRegistrar,
        deployment.contracts.BasePriceOracle,
        60, // minCommitmentAge
        86400, // maxCommitmentAge
        deployment.contracts.ReverseRegistrar,
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

    // ============================================
    // PHASE 3: MARKETPLACE & DEFI
    // ============================================

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

    // 13. Deploy CrossChainBridge
    console.log("\n13. Deploying CrossChainBridge...");
    const CrossChainBridge = await ethers.getContractFactory("CrossChainBridge");
    const bridge = await CrossChainBridge.deploy(
        deployer.address,
        { nonce: nonce++ }
    );
    await bridge.waitForDeployment();
    deployment.contracts.CrossChainBridge = await bridge.getAddress();
    console.log("✅ CrossChainBridge:", deployment.contracts.CrossChainBridge);
    await delay(2000);

    // ============================================
    // CONFIGURATION
    // ============================================

    console.log("\n\n⚙️  Configuring Contracts...\n");

    // Set up .base TLD in registry
    console.log("Setting up .base TLD in registry...");
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
    const tx2 = await registrar.addController(deployment.contracts.BaseController, { nonce: nonce++ });
    await tx2.wait();
    console.log("✅ BaseController added as controller");
    await delay(2000);

    // Set reverse registrar default resolver
    console.log("\nSetting ReverseRegistrar default resolver...");
    const tx3 = await reverseRegistrar.setDefaultResolver(
        deployment.contracts.DefaultReverseResolver,
        { nonce: nonce++ }
    );
    await tx3.wait();
    console.log("✅ Default reverse resolver set");

    // ============================================
    // SAVE DEPLOYMENT
    // ============================================

    console.log("\n\n🎉 COMPLETE DEPLOYMENT SUCCESSFUL!\n");
    console.log("=" .repeat(60));
    console.log("\n📋 Contract Addresses:\n");

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
    console.log("\n🔗 Get testnet ETH from:");
    console.log("   - https://www.alchemy.com/faucets/base-sepolia");
    console.log("   - https://www.coinbase.com/faucets/base-ethereum-goerli-faucet");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Deployment failed:", error);
        process.exit(1);
    });
