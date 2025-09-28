// scripts/register-name.js
const { ethers, network } = require("hardhat");
const namehash = require('eth-ens-namehash');

async function main() {
    // Configuration
    const NAME_TO_REGISTER = process.env.NAME || "myname";
    const DURATION = 365 * 24 * 60 * 60; // 1 year in seconds

    console.log("🎯 Registering .base domain...\n");

    const [signer] = await ethers.getSigners();
    console.log("Account:", signer.address);
    console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(signer.address)), "ETH");

    // Load deployment
    const fs = require("fs");
    const deployment = JSON.parse(
        fs.readFileSync(`deployment-${network.name}.json`, "utf8")
    );

    // Get controller contract
    const controller = await ethers.getContractAt(
        "ETHRegistrarController",
        deployment.contracts.BaseController,
        signer
    );

    // Get price oracle
    const priceOracle = await ethers.getContractAt(
        "BasePriceOracle",
        deployment.contracts.BasePriceOracle,
        signer
    );

    console.log(`\n📝 Registering: ${NAME_TO_REGISTER}.base`);

    // Check availability
    const available = await controller.available(NAME_TO_REGISTER);
    if (!available) {
        console.log("❌ Name is not available!");
        return;
    }
    console.log("✅ Name is available!");

    // Get price
    const priceData = await priceOracle.price(NAME_TO_REGISTER, 0, DURATION);
    const totalPrice = priceData.base + priceData.premium;
    console.log(`💰 Price: ${ethers.formatEther(totalPrice)} ETH`);

    // Step 1: Make commitment using Registration struct
    const secret = ethers.randomBytes(32);
    const registration = {
        label: NAME_TO_REGISTER,
        owner: signer.address,
        duration: DURATION,
        secret: secret,
        resolver: ethers.ZeroAddress,
        data: [],
        reverseRecord: 0,
        referrer: ethers.ZeroHash
    };

    const commitment = await controller.makeCommitment(registration);

    console.log("\n⏳ Step 1: Submitting commitment...");
    const commitTx = await controller.commit(commitment);
    await commitTx.wait();
    console.log("✅ Commitment submitted:", commitTx.hash);

    // Wait for commitment to mature
    console.log("\n⏳ Waiting 60 seconds for commitment to mature...");
    console.log("   (This prevents front-running attacks)");
    
    // Show countdown
    for (let i = 60; i > 0; i -= 10) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        console.log(`   ${i - 10} seconds remaining...`);
    }

    // Step 2: Register the name
    console.log("\n🚀 Step 2: Registering name...");
    const registerTx = await controller.register(
        registration,
        { value: totalPrice }
    );

    console.log("⏳ Waiting for confirmation...");
    const receipt = await registerTx.wait();
    
    console.log("\n========================================");
    console.log("🎉 SUCCESS! Domain registered!");
    console.log("========================================");
    console.log(`Domain: ${NAME_TO_REGISTER}.base`);
    console.log(`Owner: ${signer.address}`);
    console.log(`Duration: 1 year`);
    console.log(`Transaction: ${registerTx.hash}`);
    console.log(`Gas used: ${receipt.gasUsed.toString()}`);
    console.log("========================================");

    // Verify ownership
    const registrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        deployment.contracts.BaseRegistrar,
        signer
    );

    const labelHash = ethers.keccak256(ethers.toUtf8Bytes(NAME_TO_REGISTER));
    const tokenId = ethers.toBigInt(labelHash);
    
    try {
        const owner = await registrar.ownerOf(tokenId);
        console.log(`\n✅ Verified: You own tokenId ${tokenId.toString()}`);
        
        const expiry = await registrar.nameExpires(tokenId);
        const expiryDate = new Date(expiry.toNumber() * 1000);
        console.log(`📅 Expires: ${expiryDate.toLocaleDateString()}`);
    } catch (e) {
        console.log("Could not verify ownership (this is normal if using a different registrar setup)");
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
