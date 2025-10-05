const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔍 Reverse Engineering makeCommitment Function\n");

    // We know THIS worked and created commitment 0x441c1d58b9646d9c4f1b9184bec03cfaa32a8f8c8d264dd6934af86b6355cf2a
    const label = "jake";
    const owner = "0xF1Ec8EB4d825A4f739425bF86957f3AE4b00A0BC";
    const duration = 31536000;
    const secret = "0x73bf88e8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4";
    const resolver = "0x0000000000000000000000000000000000000000";
    const data = [];
    const reverseRecord = false;
    
    console.log("Testing different makeCommitment signatures...\n");

    // Try the OLD 8-parameter signature
    const oldAbi = [
        "function makeCommitment(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) pure returns (bytes32)"
    ];

    try {
        const oldController = new ethers.Contract(controllerAddress, oldAbi, provider);
        const oldHash = await oldController.makeCommitment(
            label, owner, duration, secret, resolver, data, reverseRecord, 0
        );
        console.log("OLD 8-param signature result:", oldHash);
        if (oldHash === "0x441c1d58b9646d9c4f1b9184bec03cfaa32a8f8c8d264dd6934af86b6355cf2a") {
            console.log("✅ THIS MATCHES! The commit() used the OLD 8-param signature");
        }
    } catch (e) {
        console.log("OLD 8-param signature failed:", e.message.substring(0, 50));
    }

    console.log("");

    // Now try NEW 9-parameter signature  
    const newAbi = [
        "function makeCommitment(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, bytes32 referrer, uint256 fuses) pure returns (bytes32)"
    ];

    try {
        const newController = new ethers.Contract(controllerAddress, newAbi, provider);
        const newHash = await newController.makeCommitment(
            label, owner, duration, secret, resolver, data, reverseRecord, 
            "0x0000000000000000000000000000000000000000000000000000000000000000", 
            0
        );
        console.log("NEW 9-param signature result:", newHash);
        if (newHash === "0xe6be8a2078a09981432434cdb92c9844889feb6b6e3b197908b5fcdb32943403") {
            console.log("✅ THIS MATCHES what register() expects!");
        }
    } catch (e) {
        console.log("NEW 9-param signature failed:", e.message.substring(0, 50));
    }

    console.log("");
    console.log("DIAGNOSIS:");
    console.log("  - commit() in frontend uses OLD makeCommitment (8 params)");
    console.log("  - register() in frontend uses NEW signature (9 params)");
    console.log("  - The contract calculates commitment hash internally in register()");
    console.log("  - register() recalculates using its own 9 params");
    console.log("  - This creates a different hash than what was stored");
    console.log("");
    console.log("SOLUTION: Update commit() to use the same 9-param makeCommitment!");
}

main().catch(console.error);
