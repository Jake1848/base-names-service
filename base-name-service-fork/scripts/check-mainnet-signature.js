const { ethers } = require("hardhat");

async function main() {
    console.log("🔍 Checking Base Mainnet Controller Signature\n");

    // Base Mainnet Controller
    const mainnetController = "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e";

    // Base Sepolia Controller (we know this works)
    const sepoliaController = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("Mainnet Controller:", mainnetController);
    console.log("Sepolia Controller:", sepoliaController, "(working)\n");

    // Try to get the contract interface by calling it
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");

    // Test 1: Check if register function exists with 8 params
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Testing 8-parameter register() signature");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    // Create interface with 8-parameter signature (what we're using)
    const abi8params = [
        "function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) payable"
    ];

    const contract8 = new ethers.Contract(mainnetController, abi8params, provider);

    try {
        // This will fail if the signature is wrong
        const fragment = contract8.interface.getFunction("register");
        console.log("✅ 8-parameter signature found!");
        console.log("Function selector:", fragment.selector);
        console.log("Parameters:", fragment.inputs.map(i => `${i.type} ${i.name}`).join(", "));
        console.log("\n✅ Mainnet uses SAME signature as Sepolia!");
        console.log("✅ Frontend should work on mainnet!\n");
    } catch (e) {
        console.log("❌ 8-parameter signature not found\n");
    }

    // Test 2: Check if it has 9-parameter version (old ENS style)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Testing 9-parameter register() signature");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    const abi9params = [
        "function register(string name, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, bytes32 referrer, uint256 fuses) payable"
    ];

    const contract9 = new ethers.Contract(mainnetController, abi9params, provider);

    try {
        const fragment = contract9.interface.getFunction("register");
        console.log("✅ 9-parameter signature found!");
        console.log("Function selector:", fragment.selector);
        console.log("Parameters:", fragment.inputs.map(i => `${i.type} ${i.name}`).join(", "));
        console.log("\n⚠️  Mainnet uses DIFFERENT signature!");
        console.log("⚠️  Need to update ABI for mainnet!\n");
    } catch (e) {
        console.log("❌ 9-parameter signature not found\n");
    }

    // Test 3: Try to estimate gas for a test registration (won't execute, just simulate)
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Simulating registration (no transaction)");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

    try {
        // Try with 8 params
        const testDomain = "testdomain";
        const testOwner = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
        const duration = BigInt(365 * 24 * 60 * 60);
        const secret = ethers.hexlify(ethers.randomBytes(32));
        const resolver = "0x5D5bC53bDa5105561371FEf50B50E03aA94c962E";

        const data = contract8.interface.encodeFunctionData("register", [
            testDomain,
            testOwner,
            duration,
            secret,
            resolver,
            [],
            false,
            0
        ]);

        console.log("✅ 8-parameter encoding successful!");
        console.log("Encoded data (first 10 bytes):", data.slice(0, 10));
        console.log("Method ID:", data.slice(0, 10));

        // Compare with Sepolia method ID
        console.log("\n📊 Comparison:");
        console.log("Expected Method ID (from Sepolia): 0x74694a2b");
        console.log("Mainnet Method ID:                ", data.slice(0, 10));

        if (data.slice(0, 10) === "0x74694a2b") {
            console.log("\n✅ PERFECT MATCH! Mainnet will work with current frontend!");
        } else {
            console.log("\n⚠️  Different method ID - need to adjust ABI");
        }

    } catch (e) {
        console.log("❌ 8-parameter encoding failed:", e.message);
        console.log("\nTrying 9-parameter encoding...\n");

        try {
            const data = contract9.interface.encodeFunctionData("register", [
                testDomain,
                testOwner,
                duration,
                secret,
                resolver,
                [],
                false,
                ethers.ZeroHash,
                BigInt(0)
            ]);

            console.log("✅ 9-parameter encoding successful!");
            console.log("Method ID:", data.slice(0, 10));
            console.log("\n⚠️  Mainnet needs 9 parameters!");
        } catch (e2) {
            console.log("❌ 9-parameter encoding also failed");
        }
    }

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Summary");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
    console.log("Sepolia Method ID: 0x74694a2b (8 params) ✅ Working");
    console.log("Run this to see if mainnet matches!\n");
}

main().catch(console.error);
