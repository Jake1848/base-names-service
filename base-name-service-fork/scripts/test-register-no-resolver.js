const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const controller = await ethers.getContractAt("ETHRegistrarController", "0xCD24477aFCB5D97B3B794a376d6a1De38e640564");

    const domain = "test456";
    const duration = BigInt(365 * 24 * 60 * 60);
    const secret = ethers.hexlify(ethers.randomBytes(32));

    console.log(`\n🔍 Testing registration WITHOUT resolver\n`);
    console.log("Domain:", domain);
    console.log("Secret:", secret);

    // Step 1: Commit
    // Compute commitment manually since deployed contract might have different signature
    const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            ["string", "address", "uint256", "bytes32", "address", "bytes[]", "uint256", "bytes32"],
            [
                domain,
                signer.address,
                duration,
                secret,
                ethers.ZeroAddress, // NO RESOLVER
                [],
                BigInt(0), // reverseRecord: false = 0
                ethers.ZeroHash // referrer
            ]
        )
    );

    console.log("\n1. Making commitment...");
    let tx = await controller.commit(commitment);
    await tx.wait();
    console.log("✅ Committed");

    // Step 2: Wait
    console.log("\n2. Waiting 60 seconds...");
    await new Promise(r => setTimeout(r, 60000));

    // Step 3: Register WITHOUT resolver
    console.log("\n3. Registering WITHOUT resolver...");
    const price = await controller.rentPrice(domain, duration);
    const totalPrice = price.base + price.premium;

    try {
        tx = await controller.register(
            domain,
            signer.address,
            duration,
            secret,
            ethers.ZeroAddress, // NO RESOLVER
            [],
            false,
            0,
            { value: totalPrice }
        );
        await tx.wait();
        console.log("✅ SUCCESS!");
        console.log("TX:", tx.hash);
    } catch (error) {
        console.log("❌ FAILED!");
        console.log("Error:", error.message);
    }
}

main().catch(console.error);
