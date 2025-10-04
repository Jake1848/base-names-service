const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const controller = await ethers.getContractAt("ETHRegistrarController", "0xCD24477aFCB5D97B3B794a376d6a1De38e640564");

    const domain = "jake";
    const secret = "0x643b9c2a9c71d5fe8a8d6485d9ee22111f6bb6a405690e9c6e887205d85e6fdf";
    const duration = BigInt(365 * 24 * 60 * 60);
    const resolver = "0x2927556a0761d6E4A6635CBE9988747625dAe125";

    console.log("Simulating register transaction...\n");

    try {
        const price = await controller.rentPrice(domain, duration);
        const totalPrice = price.base + price.premium;

        console.log("Price:", ethers.formatEther(totalPrice), "ETH");
        console.log("Calling register...\n");

        const tx = await controller.register.staticCall(
            domain,
            signer.address,
            duration,
            secret,
            resolver,
            [],
            false,
            0,
            { value: totalPrice }
        );

        console.log("✅ Transaction would succeed!");
        console.log("Result:", tx);

    } catch (error) {
        console.log("❌ Transaction would fail!");
        console.log("Error:", error.message);

        if (error.data) {
            console.log("\nError data:", error.data);
        }

        // Try to decode the error
        try {
            const errorData = error.data;
            console.log("\nTrying to decode error...");

            // Common ENS errors
            const errors = [
                "CommitmentNotFound(bytes32)",
                "CommitmentTooNew(bytes32,uint256,uint256)",
                "CommitmentTooOld(bytes32,uint256,uint256)",
                "DurationTooShort(uint256)",
                "InsufficientValue()",
                "NameNotAvailable(string)"
            ];

            for (const errorSig of errors) {
                try {
                    const iface = new ethers.Interface([`error ${errorSig}`]);
                    const decoded = iface.parseError(errorData);
                    if (decoded) {
                        console.log("Decoded error:", errorSig);
                        console.log("Args:", decoded.args);
                        break;
                    }
                } catch (e) {
                    // Try next
                }
            }
        } catch (e) {
            console.log("Could not decode error");
        }
    }
}

main().catch(console.error);
