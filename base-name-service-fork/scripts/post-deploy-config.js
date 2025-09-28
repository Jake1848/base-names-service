const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const namehash = require("eth-ens-namehash");

async function main() {
    const network = await ethers.provider.getNetwork();
    const deploymentFile = path.join(__dirname, `../deployment-${network.name}.json`);

    console.log("⚙️ Post-deployment Configuration...\n");

    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found for ${network.name}`);
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const contracts = deployment.contracts;

    const [deployer] = await ethers.getSigners();
    console.log(`Configuring with account: ${deployer.address}\n`);

    // 1. Configure RegistrationLimiter
    if (contracts.RegistrationLimiter && contracts.ETHRegistrarController) {
        console.log("1️⃣ Configuring RegistrationLimiter...");
        const limiter = await ethers.getContractAt("RegistrationLimiter", contracts.RegistrationLimiter);

        // Check if controller is already set
        const currentController = await limiter.controller();
        if (currentController === ethers.ZeroAddress) {
            console.log("   Setting controller...");
            const tx = await limiter.setController(contracts.ETHRegistrarController);
            await tx.wait();
            console.log("   ✅ Controller set!");
        } else {
            console.log(`   ✅ Controller already set: ${currentController}`);
        }

        // Configure limits if needed
        const currentLimit = await limiter.maxRegistrationsPerWindow();
        const currentWindow = await limiter.timeWindow();
        console.log(`   Current limit: ${currentLimit} registrations per ${currentWindow/3600} hour(s)`);
    }

    // 2. Configure FeeManager
    if (contracts.FeeManager) {
        console.log("\n2️⃣ Configuring FeeManager...");
        const feeManager = await ethers.getContractAt("FeeManager", contracts.FeeManager);

        const treasury = await feeManager.treasury();
        const maxWithdrawal = await feeManager.maxWithdrawal();

        console.log(`   Treasury: ${treasury}`);
        console.log(`   Max withdrawal: ${ethers.formatEther(maxWithdrawal)} ETH`);
        console.log(`   Emergency limit: 10 ETH (hardcoded)`);

        // You can update these if needed:
        // await feeManager.setMaxWithdrawal(ethers.parseEther("50"));
    }

    // 3. Configure ETHRegistrarController
    if (contracts.ETHRegistrarController || contracts.BaseController) {
        console.log("\n3️⃣ Configuring ETHRegistrarController...");
        const controllerAddress = contracts.ETHRegistrarController || contracts.BaseController;
        const controller = await ethers.getContractAt("ETHRegistrarController", controllerAddress);

        const referrerFee = await controller.referrerFeePercentage();
        const isPaused = await controller.paused();

        console.log(`   Referrer fee: ${referrerFee / 100}%`);
        console.log(`   Paused: ${isPaused}`);

        // You can update referrer fee if needed:
        // await controller.setReferrerFeePercentage(300); // 3%
    }

    // 4. Configure Resolvers
    if (contracts.PublicResolver && contracts.ENSRegistry) {
        console.log("\n4️⃣ Configuring Resolvers...");
        const resolver = await ethers.getContractAt("PublicResolver", contracts.PublicResolver);
        const registry = await ethers.getContractAt("ENSRegistry", contracts.ENSRegistry);

        // Set default resolver for .base TLD
        const baseNode = namehash.hash("base");
        const currentResolver = await registry.resolver(baseNode);

        if (currentResolver === ethers.ZeroAddress) {
            console.log("   Setting default resolver for .base...");
            const tx = await registry.setResolver(baseNode, contracts.PublicResolver);
            await tx.wait();
            console.log("   ✅ Default resolver set!");
        } else {
            console.log(`   ✅ Resolver already set: ${currentResolver}`);
        }
    }

    // 5. Verify critical permissions
    console.log("\n5️⃣ Verifying Permissions...");

    if (contracts.BaseRegistrar) {
        const registrar = await ethers.getContractAt("BaseRegistrarImplementation", contracts.BaseRegistrar);
        const controllerAddress = contracts.ETHRegistrarController || contracts.BaseController;

        if (controllerAddress) {
            const isController = await registrar.isController(controllerAddress);
            console.log(`   Controller authorized in Registrar: ${isController ? '✅' : '❌'}`);

            if (!isController) {
                console.log("   Adding controller...");
                const tx = await registrar.addController(controllerAddress);
                await tx.wait();
                console.log("   ✅ Controller added!");
            }
        }
    }

    console.log("\n========================================");
    console.log("✅ Post-deployment configuration complete!");
    console.log("\n📋 Next Steps:");
    console.log("1. Run verification: npm run verify:deployment");
    console.log("2. Transfer to multisig: npm run multisig:transfer");
    console.log("3. Test registration: npm run register");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });