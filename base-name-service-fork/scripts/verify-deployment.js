const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');

/**
 * Comprehensive deployment verification script
 * Verifies all contracts, permissions, and configurations
 */
async function main() {
    console.log("\n🔍 Starting Comprehensive Deployment Verification...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Verifying deployment by:", deployer.address);

    // Load deployed contract addresses
    const deploymentFile = './deployment-addresses.json';
    let contracts;
    try {
        contracts = require(deploymentFile);
    } catch (error) {
        console.error("❌ Could not load deployment addresses from", deploymentFile);
        console.error("Run the deployment script first!");
        process.exit(1);
    }

    console.log("\n📋 Verifying Contract Deployments...\n");

    // Verify all contracts exist and are deployed
    const contractsToVerify = [
        'ENSRegistry',
        'BaseRegistrar',
        'ReverseRegistrar',
        'DefaultReverseResolver',
        'PublicResolver',
        'BaseController',
        'BasePriceOracle',
        'BulkRenewal',
        'StaticBulkRenewal'
    ];

    for (const contractName of contractsToVerify) {
        if (!contracts[contractName]) {
            console.error(`❌ ${contractName} address not found in deployment`);
            process.exit(1);
        }

        const code = await ethers.provider.getCode(contracts[contractName]);
        if (code === '0x') {
            console.error(`❌ ${contractName} at ${contracts[contractName]} has no code!`);
            process.exit(1);
        }
        console.log(`✅ ${contractName}: ${contracts[contractName]}`);
    }

    console.log("\n🔐 Verifying ENS Registry Configuration...\n");

    // Get contract instances
    const registry = await ethers.getContractAt("ENSRegistry", contracts.ENSRegistry);
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", contracts.BaseRegistrar);
    const controller = await ethers.getContractAt("ETHRegistrarController", contracts.BaseController);
    const priceOracle = await ethers.getContractAt("BasePriceOracle", contracts.BasePriceOracle);
    const publicResolver = await ethers.getContractAt("PublicResolver", contracts.PublicResolver);

    // Verify .base TLD ownership
    const baseNode = namehash.hash("base");
    const registrarAddress = await registry.owner(baseNode);
    if (registrarAddress.toLowerCase() !== contracts.BaseRegistrar.toLowerCase()) {
        console.error(`❌ .base TLD owner is ${registrarAddress}, expected ${contracts.BaseRegistrar}`);
        process.exit(1);
    }
    console.log("✅ .base TLD is owned by BaseRegistrar");

    // Verify resolver for .base
    const baseResolver = await registry.resolver(baseNode);
    if (baseResolver.toLowerCase() !== contracts.PublicResolver.toLowerCase()) {
        console.error(`❌ .base resolver is ${baseResolver}, expected ${contracts.PublicResolver}`);
        process.exit(1);
    }
    console.log("✅ .base resolver is PublicResolver");

    console.log("\n🎛️  Verifying BaseRegistrar Configuration...\n");

    // Verify controller is added to registrar
    const isController = await registrar.controllers(contracts.BaseController);
    if (!isController) {
        console.error("❌ ETHRegistrarController not added to BaseRegistrar!");
        process.exit(1);
    }
    console.log("✅ ETHRegistrarController added to BaseRegistrar");

    // Verify registrar's base node
    const registrarBaseNode = await registrar.baseNode();
    if (registrarBaseNode !== baseNode) {
        console.error(`❌ BaseRegistrar base node is ${registrarBaseNode}, expected ${baseNode}`);
        process.exit(1);
    }
    console.log("✅ BaseRegistrar base node is correct");

    // Verify registrar's ENS reference
    const registrarENS = await registrar.ens();
    if (registrarENS.toLowerCase() !== contracts.ENSRegistry.toLowerCase()) {
        console.error(`❌ BaseRegistrar ENS is ${registrarENS}, expected ${contracts.ENSRegistry}`);
        process.exit(1);
    }
    console.log("✅ BaseRegistrar ENS reference is correct");

    console.log("\n⚙️  Verifying Controller Configuration...\n");

    // Verify controller's price oracle
    const controllerPriceOracle = await controller.prices();
    if (controllerPriceOracle.toLowerCase() !== contracts.BasePriceOracle.toLowerCase()) {
        console.error(`❌ Controller price oracle is ${controllerPriceOracle}, expected ${contracts.BasePriceOracle}`);
        process.exit(1);
    }
    console.log("✅ Controller price oracle is correct");

    // Verify controller's reverse registrar
    const controllerReverseRegistrar = await controller.reverseRegistrar();
    if (controllerReverseRegistrar.toLowerCase() !== contracts.ReverseRegistrar.toLowerCase()) {
        console.error(`❌ Controller reverse registrar is ${controllerReverseRegistrar}, expected ${contracts.ReverseRegistrar}`);
        process.exit(1);
    }
    console.log("✅ Controller reverse registrar is correct");

    // Verify controller's registrar
    const controllerRegistrar = await controller.base();
    if (controllerRegistrar.toLowerCase() !== contracts.BaseRegistrar.toLowerCase()) {
        console.error(`❌ Controller registrar is ${controllerRegistrar}, expected ${contracts.BaseRegistrar}`);
        process.exit(1);
    }
    console.log("✅ Controller base registrar is correct");

    console.log("\n💰 Verifying Price Oracle...\n");

    // Test price oracle with different name lengths
    const shortName = "ab";
    const mediumName = "test";
    const longName = "verylongdomainname";

    try {
        const shortPrice = await priceOracle.price(shortName, 0, 31536000); // 1 year
        const mediumPrice = await priceOracle.price(mediumName, 0, 31536000);
        const longPrice = await priceOracle.price(longName, 0, 31536000);

        console.log(`  Short name (${shortName}): ${ethers.formatEther(shortPrice.base)} ETH`);
        console.log(`  Medium name (${mediumName}): ${ethers.formatEther(mediumPrice.base)} ETH`);
        console.log(`  Long name (${longName}): ${ethers.formatEther(longPrice.base)} ETH`);

        // Verify pricing logic: shorter names should cost more
        if (shortPrice.base <= mediumPrice.base || mediumPrice.base <= longPrice.base) {
            console.error("❌ Price oracle pricing logic appears incorrect!");
            process.exit(1);
        }
        console.log("✅ Price oracle pricing logic is correct");
    } catch (error) {
        console.error("❌ Error testing price oracle:", error.message);
        process.exit(1);
    }

    console.log("\n🔄 Verifying Reverse Registrar...\n");

    const reverseRegistrar = await ethers.getContractAt("ReverseRegistrar", contracts.ReverseRegistrar);

    // Verify reverse registrar's ENS
    const reverseENS = await reverseRegistrar.ens();
    if (reverseENS.toLowerCase() !== contracts.ENSRegistry.toLowerCase()) {
        console.error(`❌ ReverseRegistrar ENS is ${reverseENS}, expected ${contracts.ENSRegistry}`);
        process.exit(1);
    }
    console.log("✅ ReverseRegistrar ENS reference is correct");

    // Verify reverse registrar's default resolver
    const reverseDefaultResolver = await reverseRegistrar.defaultResolver();
    if (reverseDefaultResolver.toLowerCase() !== contracts.DefaultReverseResolver.toLowerCase()) {
        console.error(`❌ ReverseRegistrar default resolver is ${reverseDefaultResolver}, expected ${contracts.DefaultReverseResolver}`);
        process.exit(1);
    }
    console.log("✅ ReverseRegistrar default resolver is correct");

    console.log("\n📝 Verifying Public Resolver...\n");

    // Verify PublicResolver's ENS
    const resolverENS = await publicResolver.ens();
    if (resolverENS.toLowerCase() !== contracts.ENSRegistry.toLowerCase()) {
        console.error(`❌ PublicResolver ENS is ${resolverENS}, expected ${contracts.ENSRegistry}`);
        process.exit(1);
    }
    console.log("✅ PublicResolver ENS reference is correct");

    console.log("\n🔁 Verifying Bulk Renewal Contracts...\n");

    const bulkRenewal = await ethers.getContractAt("BulkRenewal", contracts.BulkRenewal);
    const staticBulkRenewal = await ethers.getContractAt("StaticBulkRenewal", contracts.StaticBulkRenewal);

    // Verify BulkRenewal's ENS
    const bulkENS = await bulkRenewal.ens();
    if (bulkENS.toLowerCase() !== contracts.ENSRegistry.toLowerCase()) {
        console.error(`❌ BulkRenewal ENS is ${bulkENS}, expected ${contracts.ENSRegistry}`);
        process.exit(1);
    }
    console.log("✅ BulkRenewal ENS reference is correct");

    // Verify StaticBulkRenewal's controller
    const staticController = await staticBulkRenewal.controller();
    if (staticController.toLowerCase() !== contracts.BaseController.toLowerCase()) {
        console.error(`❌ StaticBulkRenewal controller is ${staticController}, expected ${contracts.BaseController}`);
        process.exit(1);
    }
    console.log("✅ StaticBulkRenewal controller is correct");

    console.log("\n🎉 All Deployment Verifications Passed!\n");
    console.log("✅ Contracts deployed correctly");
    console.log("✅ Permissions configured correctly");
    console.log("✅ References between contracts are valid");
    console.log("✅ Price oracle functioning as expected");
    console.log("\n🚀 Deployment is ready for use!");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Verification failed:", error);
        process.exit(1);
    });
