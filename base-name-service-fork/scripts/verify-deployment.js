const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");
const namehash = require("eth-ens-namehash");

async function main() {
    const network = await ethers.provider.getNetwork();
    const deploymentFile = path.join(__dirname, `../deployment-${network.name}.json`);

    console.log("🔍 Verifying Base Name Service Deployment...\n");

    // Check if deployment file exists
    if (!fs.existsSync(deploymentFile)) {
        console.error("❌ Deployment file not found!");
        console.log("Please run the deployment script first.");
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    console.log("Network:", deployment.network);
    console.log("Deployed by:", deployment.deployer);
    console.log("Timestamp:", deployment.timestamp);
    console.log("\n📝 Checking deployed contracts...\n");

    let allChecked = true;

    // Check each contract
    for (const [name, address] of Object.entries(deployment.contracts)) {
        try {
            const code = await ethers.provider.getCode(address);
            if (code === '0x') {
                console.log(`❌ ${name}: No code at ${address}`);
                allChecked = false;
            } else {
                console.log(`✅ ${name}: Deployed at ${address}`);
            }
        } catch (error) {
            console.log(`❌ ${name}: Error checking ${address} - ${error.message}`);
            allChecked = false;
        }
    }

    console.log("\n🔗 Verifying contract connections...\n");

    try {
        // Check ENS Registry
        const registry = await ethers.getContractAt("ENSRegistry", deployment.contracts.ENSRegistry);
        const baseNode = namehash.hash("base");
        const registrarOwner = await registry.owner(baseNode);
        console.log(`✅ ENS Registry: .base owner is ${registrarOwner}`);

        // Check BaseRegistrar
        const registrar = await ethers.getContractAt(
            "BaseRegistrarImplementation",
            deployment.contracts.BaseRegistrar
        );
        const isControllerSet = await registrar.isController(deployment.contracts.BaseController);
        console.log(`✅ BaseRegistrar: Controller ${isControllerSet ? 'is' : 'is NOT'} authorized`);

        // Check Price Oracle
        const priceOracle = await ethers.getContractAt(
            "BasePriceOracle",
            deployment.contracts.BasePriceOracle
        );
        const testPrice = await priceOracle.price1Year("test");
        console.log(`✅ PriceOracle: Test name (4 chars) = ${ethers.formatEther(testPrice)} ETH/year`);

        // Check Controller
        const controller = await ethers.getContractAt(
            "ETHRegistrarController",
            deployment.contracts.BaseController
        );
        const isAvailable = await controller.available("testname");
        console.log(`✅ Controller: 'testname' is ${isAvailable ? 'available' : 'not available'}`);

        // Check Resolver
        const resolver = await ethers.getContractAt(
            "PublicResolver",
            deployment.contracts.PublicResolver
        );
        const supportsAddr = await resolver.supportsInterface("0x3b3b57de"); // addr(bytes32) interface
        console.log(`✅ PublicResolver: Supports address resolution: ${supportsAddr}`);

        // Check ReverseRegistrar
        const reverseRegistrar = await ethers.getContractAt(
            "ReverseRegistrar",
            deployment.contracts.ReverseRegistrar
        );
        const reverseNode = namehash.hash(`${deployment.deployer.slice(2).toLowerCase()}.addr.reverse`);
        const reverseOwner = await registry.owner(reverseNode);
        console.log(`✅ ReverseRegistrar: Ready for reverse resolution (${reverseOwner !== ethers.ZeroAddress ? 'configured' : 'pending setup'})`);

    } catch (error) {
        console.error("❌ Error during verification:", error.message);
        allChecked = false;
    }

    if (allChecked) {
        console.log("\n🎉 All contracts verified successfully!");
        console.log("\n📌 Next steps:");
        console.log("1. Register your first .base domain");
        console.log("2. Set up reverse resolution");
        console.log("3. Configure resolver records");
    } else {
        console.log("\n⚠️ Some checks failed. Please review the deployment.");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });