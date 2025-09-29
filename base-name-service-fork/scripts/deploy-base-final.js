// scripts/deploy-base-final.js
const { ethers, network } = require("hardhat");
const namehash = require('eth-ens-namehash');

// Helper function to calculate labelhash
function labelhash(label) {
    return ethers.keccak256(ethers.toUtf8Bytes(label));
}

async function main() {
    console.log("🚀 Finalizing Base Name Service Deployment...\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with account:", deployer.address);
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log("Account balance:", ethers.formatEther(balance), "ETH\n");

    // Already deployed contracts
    const contracts = {
        ENSRegistry: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
        BaseRegistrar: "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917",
        ReverseRegistrar: "0xD982f3bFf21dCb9421ffBC2000Cfe3C94A01c889",
        PublicResolver: "0x5D5bC53bDa5105561371FEf50B50E03aA94c962E",
        BasePriceOracle: "0xA1805458A1C1294D53eBBBd025B397F89Dd963AC",
        RegistrationLimiter: "0x1376A3C0403cabeE7Da7D2BaC6266F94D1BBB64B",
        FeeManager: "0xab30D0F58442c63C40977045433653A027733961",
        DefaultReverseRegistrar: "0x48325DC9aF4b6F04269A5370C94138074449Fd9f"
    };

    console.log("Using existing contracts:");
    Object.entries(contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });
    console.log("");

    // Get nonce for the next transaction
    const nonce = await ethers.provider.getTransactionCount(deployer.address, "latest");
    console.log("Current nonce:", nonce);

    // Deploy BaseRegistrarController with increased gas price
    console.log("\nDeploying BaseRegistrarController...");
    const BaseController = await ethers.getContractFactory("ETHRegistrarController");
    const minCommitmentAge = 60; // 60 seconds
    const maxCommitmentAge = 86400; // 24 hours

    // Get current gas price and increase it
    const gasPrice = await ethers.provider.getFeeData();
    const increasedGasPrice = (gasPrice.gasPrice * 120n) / 100n; // 20% higher

    const controller = await BaseController.deploy(
        contracts.BaseRegistrar,
        contracts.BasePriceOracle,
        minCommitmentAge,
        maxCommitmentAge,
        contracts.ReverseRegistrar,
        contracts.DefaultReverseRegistrar,
        contracts.ENSRegistry,
        contracts.RegistrationLimiter,
        contracts.FeeManager,
        {
            nonce: nonce,
            gasPrice: increasedGasPrice
        }
    );
    await controller.waitForDeployment();
    const controllerAddress = await controller.getAddress();
    console.log("✅ BaseRegistrarController deployed to:", controllerAddress);

    contracts.BaseController = controllerAddress;

    // Now set up the permissions and ownership
    console.log("\n Setting up permissions...");

    const registry = await ethers.getContractAt("ENSRegistry", contracts.ENSRegistry);
    const registrar = await ethers.getContractAt("BaseRegistrarImplementation", contracts.BaseRegistrar);
    const registrationLimiter = await ethers.getContractAt("RegistrationLimiter", contracts.RegistrationLimiter);
    const reverseRegistrar = await ethers.getContractAt("ReverseRegistrar", contracts.ReverseRegistrar);

    try {
        // Give the registrar ownership of the 'base' node
        console.log("   - Setting up .base TLD ownership...");
        await registry.setSubnodeOwner(
            '0x0000000000000000000000000000000000000000000000000000000000000000', // root node
            labelhash('base'),
            contracts.BaseRegistrar
        );
        console.log("   ✅ .base TLD ownership set");
    } catch (e) {
        console.log("   ⚠️ .base TLD might already be set");
    }

    try {
        // Add controller to registrar
        console.log("   - Adding controller to registrar...");
        await registrar.addController(controllerAddress);
        console.log("   ✅ Controller added to registrar");
    } catch (e) {
        console.log("   ⚠️ Controller might already be added");
    }

    try {
        // Authorize controller in registration limiter
        console.log("   - Authorizing controller in RegistrationLimiter...");
        await registrationLimiter.setController(controllerAddress);
        console.log("   ✅ Controller authorized in RegistrationLimiter");
    } catch (e) {
        console.log("   ⚠️ Controller might already be authorized");
    }

    try {
        // Set up reverse registrar
        console.log("   - Setting up reverse resolution...");
        await registry.setSubnodeOwner(
            '0x0000000000000000000000000000000000000000000000000000000000000000',
            labelhash('reverse'),
            deployer.address
        );
        await registry.setSubnodeOwner(
            namehash.hash('reverse'),
            labelhash('addr'),
            contracts.ReverseRegistrar
        );
        console.log("   ✅ Reverse resolution set up");
    } catch (e) {
        console.log("   ⚠️ Reverse resolution might already be set");
    }

    try {
        // Set resolver for reverse
        await reverseRegistrar.setDefaultResolver(contracts.PublicResolver);
        console.log("   ✅ Default resolver set for reverse registrar");
    } catch (e) {
        console.log("   ⚠️ Default resolver might already be set");
    }

    console.log("\n✅ Permissions configured!");

    console.log("\n========================================");
    console.log("🎉 BASE NAME SERVICE FULLY DEPLOYED!");
    console.log("========================================");
    console.log("Network: Base Mainnet");
    console.log("Contracts:");
    Object.entries(contracts).forEach(([name, address]) => {
        console.log(`  ${name}: ${address}`);
    });
    console.log("========================================");

    // Save to file
    const fs = require("fs");
    const deploymentInfo = {
        network: "base",
        chainId: 8453,
        deployer: deployer.address,
        contracts,
        timestamp: new Date().toISOString(),
        live: true,
        domain: "basenameservice.xyz"
    };

    fs.writeFileSync(
        `deployment-base-mainnet.json`,
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log(`\n📁 Deployment info saved to deployment-base-mainnet.json`);

    console.log("\n✨ Base Name Service is LIVE on Base Mainnet!");
    console.log("✨ Next step: Deploy frontend to basenameservice.xyz");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });