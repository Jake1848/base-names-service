const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const network = await ethers.provider.getNetwork();
    const deploymentFile = path.join(__dirname, `../deployment-${network.name}.json`);

    console.log("🔐 Transferring ownership to MultiSig...\n");

    // Get MultiSig address from environment or command line
    const MULTISIG_ADDRESS = process.env.MULTISIG_ADDRESS || process.argv[2];

    if (!MULTISIG_ADDRESS) {
        console.error("❌ Please provide MultiSig address:");
        console.error("   Via environment: MULTISIG_ADDRESS=0x... npm run multisig:transfer");
        console.error("   Or command line: npm run multisig:transfer -- 0x...");
        process.exit(1);
    }

    // Validate address
    if (!ethers.isAddress(MULTISIG_ADDRESS)) {
        console.error(`❌ Invalid address: ${MULTISIG_ADDRESS}`);
        process.exit(1);
    }

    const [deployer] = await ethers.getSigners();
    console.log(`Current owner: ${deployer.address}`);
    console.log(`MultiSig address: ${MULTISIG_ADDRESS}\n`);

    if (!fs.existsSync(deploymentFile)) {
        console.error(`❌ Deployment file not found for ${network.name}`);
        process.exit(1);
    }

    const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
    const contracts = deployment.contracts;

    // Contracts that need ownership transfer
    const ownershipTransfers = [
        { name: 'ENSRegistry', address: contracts.ENSRegistry },
        { name: 'BaseRegistrar', address: contracts.BaseRegistrar },
        { name: 'ETHRegistrarController', address: contracts.BaseController || contracts.ETHRegistrarController },
        { name: 'FeeManager', address: contracts.FeeManager },
        { name: 'RegistrationLimiter', address: contracts.RegistrationLimiter }
    ];

    console.log("⏳ Starting ownership transfers...\n");

    for (const { name, address } of ownershipTransfers) {
        if (!address) {
            console.log(`⚠️ ${name}: Address not found in deployment, skipping...`);
            continue;
        }

        try {
            console.log(`📝 ${name}:`);
            console.log(`   Address: ${address}`);

            // Get contract instance
            let contract;

            if (name === 'ENSRegistry') {
                contract = await ethers.getContractAt("ENSRegistry", address);

                // NOTE: In production, we typically don't own the root node (0x00)
                // Instead, we only own the .base node. For local/test deployments,
                // we might own root, but for mainnet, only transfer .base ownership.

                const namehash = require("eth-ens-namehash");
                const baseNode = namehash.hash("base");
                const currentOwner = await contract.owner(baseNode);

                if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
                    console.log(`   Transferring .base node ownership...`);
                    const tx = await contract.setOwner(baseNode, MULTISIG_ADDRESS);
                    await tx.wait();
                    console.log(`   ✅ .base ownership transferred!`);
                } else if (currentOwner.toLowerCase() === MULTISIG_ADDRESS.toLowerCase()) {
                    console.log(`   ✅ .base already owned by MultiSig`);
                } else {
                    console.log(`   ⚠️ Not owner of .base node, current owner: ${currentOwner}`);
                }
            } else if (name === 'BaseRegistrar') {
                contract = await ethers.getContractAt("BaseRegistrarImplementation", address);
                const currentOwner = await contract.owner();

                if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
                    console.log(`   Transferring ownership...`);
                    const tx = await contract.transferOwnership(MULTISIG_ADDRESS);
                    await tx.wait();
                    console.log(`   ✅ Ownership transferred!`);
                } else if (currentOwner.toLowerCase() === MULTISIG_ADDRESS.toLowerCase()) {
                    console.log(`   ✅ Already owned by MultiSig`);
                } else {
                    console.log(`   ⚠️ Not owner, current owner: ${currentOwner}`);
                }
            } else if (name === 'ETHRegistrarController') {
                contract = await ethers.getContractAt("ETHRegistrarController", address);
                const currentOwner = await contract.owner();

                if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
                    console.log(`   Transferring ownership...`);
                    const tx = await contract.transferOwnership(MULTISIG_ADDRESS);
                    await tx.wait();
                    console.log(`   ✅ Ownership transferred!`);
                } else if (currentOwner.toLowerCase() === MULTISIG_ADDRESS.toLowerCase()) {
                    console.log(`   ✅ Already owned by MultiSig`);
                } else {
                    console.log(`   ⚠️ Not owner, current owner: ${currentOwner}`);
                }
            } else if (name === 'FeeManager') {
                contract = await ethers.getContractAt("FeeManager", address);
                const currentOwner = await contract.owner();

                if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
                    console.log(`   Transferring ownership...`);
                    const tx = await contract.transferOwnership(MULTISIG_ADDRESS);
                    await tx.wait();
                    console.log(`   ✅ Ownership transferred!`);

                    // Also update treasury if needed
                    const currentTreasury = await contract.treasury();
                    if (currentTreasury.toLowerCase() === deployer.address.toLowerCase()) {
                        console.log(`   Updating treasury to MultiSig...`);
                        const tx2 = await contract.setTreasury(MULTISIG_ADDRESS);
                        await tx2.wait();
                        console.log(`   ✅ Treasury updated!`);
                    }
                } else if (currentOwner.toLowerCase() === MULTISIG_ADDRESS.toLowerCase()) {
                    console.log(`   ✅ Already owned by MultiSig`);
                } else {
                    console.log(`   ⚠️ Not owner, current owner: ${currentOwner}`);
                }
            } else if (name === 'RegistrationLimiter') {
                contract = await ethers.getContractAt("RegistrationLimiter", address);
                const currentOwner = await contract.owner();

                if (currentOwner.toLowerCase() === deployer.address.toLowerCase()) {
                    console.log(`   Transferring ownership...`);
                    const tx = await contract.transferOwnership(MULTISIG_ADDRESS);
                    await tx.wait();
                    console.log(`   ✅ Ownership transferred!`);
                } else if (currentOwner.toLowerCase() === MULTISIG_ADDRESS.toLowerCase()) {
                    console.log(`   ✅ Already owned by MultiSig`);
                } else {
                    console.log(`   ⚠️ Not owner, current owner: ${currentOwner}`);
                }
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
        }
        console.log();
    }

    console.log("========================================");
    console.log("✅ Ownership transfer process complete!");
    console.log(`\n⚠️ IMPORTANT: The new owner (${MULTISIG_ADDRESS}) must accept ownership for some contracts.`);
    console.log("Please verify all ownerships using the verify-deployment script.");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });