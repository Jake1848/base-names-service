const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    // Your wallet - just for simulation, no private key needed
    const userAddress = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    const domain = "jake";
    const secret = "0x32547810075909e005ee98f3369faba8904b6556a957c94bbb791a4b22d5fcf6";
    const duration = BigInt(365 * 24 * 60 * 60);
    const resolver = "0x2927556a0761d6E4A6635CBE9988747625dAe125";

    console.log("\n🔍 Simulating EXACT register transaction\n");

    const controllerAbi = [
        "function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) payable"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    try {
        // Static call (simulation)
        await controller.register.staticCall(
            domain,
            userAddress,
            duration,
            secret,
            resolver,
            [],
            false,
            0,
            { value: BigInt(500000000000000), from: userAddress }
        );

        console.log("✅ Transaction would SUCCEED!");
    } catch (error) {
        console.log("❌ Transaction would FAIL!");
        console.log("\nError message:", error.message);

        if (error.data) {
            console.log("\nError data:", error.data);

            // Try to decode custom errors
            const errorSelectors = {
                "0x3fef3781": "CommitmentNotFound(bytes32)",
                "0x7ba3dd65": "CommitmentTooNew(bytes32,uint256,uint256)",
                "0x2e2b8c07": "CommitmentTooOld(bytes32,uint256,uint256)",
                "0x5cd83192": "DurationTooShort(uint256)",
                "0x21e072eb": "InsufficientValue()",
                "0x2c77e6a3": "NameNotAvailable(string)"
            };

            const errorSelector = error.data.slice(0, 10);
            console.log("\nError selector:", errorSelector);

            if (errorSelectors[errorSelector]) {
                console.log("Known error:", errorSelectors[errorSelector]);
            } else {
                console.log("Unknown error selector");
            }
        }

        if (error.reason) {
            console.log("\nReason:", error.reason);
        }
    }
}

main().catch(console.error);
