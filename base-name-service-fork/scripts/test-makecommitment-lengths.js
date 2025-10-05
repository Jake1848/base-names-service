const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    
    const owner = "0xF1Ec8EB4d825A4f739425bF86957f3AE4b00A0BC";
    const duration = 31536000;
    const secret = "0x73bf88e8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4";
    const resolver = "0x0000000000000000000000000000000000000000";
    const data = [];
    const reverseRecord = false;
    const ownerControlledFuses = 0;

    console.log("\n🔍 Testing makeCommitment with Different Name Lengths\n");

    const controllerAbi = [
        "function makeCommitment(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) pure returns (bytes32)"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    const testNames = ["a", "ab", "abc", "test", "jake", "testname"];

    for (const name of testNames) {
        try {
            const hash = await controller.makeCommitment(
                name, owner, duration, secret, resolver, data, reverseRecord, ownerControlledFuses
            );
            console.log("✅ \"" + name + "\" (" + name.length + " chars): " + hash);
        } catch (error) {
            const msg = error.message.substring(0, 50);
            console.log("❌ \"" + name + "\" (" + name.length + " chars): " + msg);
        }
    }
}

main().catch(console.error);
