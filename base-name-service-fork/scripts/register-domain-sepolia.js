const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564"; // Sepolia with cheap prices!
    const resolver = "0x2927556a0761d6E4A6635CBE9988747625dAe125";

    const controller = await ethers.getContractAt("ETHRegistrarController", controllerAddress);

    const domain = "jake"; // ✏️  CHANGE THIS to your desired domain!
    const duration = BigInt(365 * 24 * 60 * 60); // 1 year
    const secret = ethers.hexlify(ethers.randomBytes(32));

    console.log(`\n🔐 Registering: ${domain}.base\n`);
    console.log("Network: Base Sepolia (Testnet)");
    console.log("Your address:", signer.address);

    // Step 1: Make commitment
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📝 Step 1/2: Making commitment...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const commitment = await controller.makeCommitment(
        domain,
        signer.address,
        duration,
        secret,
        resolver,
        [],
        true,
        ethers.ZeroHash,
        0
    );

    console.log("Commitment hash:", commitment);

    const tx1 = await controller.commit(commitment);
    console.log("Transaction sent:", tx1.hash);
    await tx1.wait();
    console.log("✅ Commitment confirmed!");

    // Step 2: Wait 60 seconds (required by ENS)
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("⏳ Waiting 60 seconds (anti-frontrunning)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    for (let i = 60; i > 0; i--) {
        process.stdout.write(`\r   ⏱️  ${i} seconds remaining...`);
        await new Promise(r => setTimeout(r, 1000));
    }
    console.log("\n\n✅ Wait complete!\n");

    // Step 3: Get price
    const price = await controller.rentPrice(domain, duration);
    const totalPrice = price.base + price.premium;

    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("💰 Price Check");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Domain: ${domain}.base`);
    console.log(`Length: ${domain.length} characters`);
    console.log(`Duration: 1 year`);
    console.log(`Base price: ${ethers.formatEther(price.base)} ETH`);
    console.log(`Premium: ${ethers.formatEther(price.premium)} ETH`);
    console.log(`Total: ${ethers.formatEther(totalPrice)} ETH`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Step 4: Register
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🚀 Step 2/2: Completing registration...");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    try {
        const tx2 = await controller.register(
            domain,
            signer.address,
            duration,
            secret,
            resolver,
            [],
            false, // Don't set reverse record for now (authorization issue)
            ethers.ZeroHash,
            0,
            { value: totalPrice }
        );

        console.log("Transaction sent:", tx2.hash);
        const receipt = await tx2.wait();
        console.log("✅ Registration confirmed in block:", receipt.blockNumber);
    } catch (error) {
        console.log("\n❌ Registration failed!");
        console.log("Error:", error.message);

        // Try to get more details
        if (error.data) {
            console.log("Error data:", error.data);
        }

        throw error;
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🎉 SUCCESS!");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`\nYou now own: ${domain}.base`);
    console.log(`Cost: ${ethers.formatEther(totalPrice)} ETH`);
    console.log("\n🔗 View on BaseScan:");
    console.log(`   https://sepolia.basescan.org/tx/${tx2.hash}`);
    console.log("\n💎 Your domain NFT should appear in your wallet!");
    console.log(`   Check: https://sepolia.basescan.org/address/${signer.address}#tokentxnsErc721\n`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Error:", error.message);
        process.exit(1);
    });
