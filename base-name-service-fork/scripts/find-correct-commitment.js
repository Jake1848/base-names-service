const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔍 Finding Correct Commitment Calculation\n");

    const label = "jake";
    const owner = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
    const duration = 31536000;
    const secret = "0x16a1d6ec6298484f8ee4b0204f411be3b3a65860a232381b11888fadd81e88f1";
    const resolver = "0x0000000000000000000000000000000000000000";
    const data = [];
    const reverseRecord = false;
    const referrer = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const fuses = 0;

    console.log("What the contract expects:", "0xf4e2d9739d34edc992ef0a5a456ae5fef164b9616c7441e0d6ee378f5a3efb29");
    console.log("What we calculated:       ", "0x8bd2b3baa007b83c769736fb37dcab720ff9fd7f5b3ec89bbc317f93ef88a369");
    console.log("");

    // Call makeCommitment directly on the contract
    const makeCommitmentAbi = [
        "function makeCommitment(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, bytes32 referrer, uint256 fuses) pure returns (bytes32)"
    ];

    const controller = new ethers.Contract(controllerAddress, makeCommitmentAbi, provider);

    try {
        const contractHash = await controller.makeCommitment(
            label, owner, duration, secret, resolver, data, reverseRecord, referrer, fuses
        );
        console.log("Contract makeCommitment() returns:", contractHash);
        
        if (contractHash === "0xf4e2d9739d34edc992ef0a5a456ae5fef164b9616c7441e0d6ee378f5a3efb29") {
            console.log("✅ THIS MATCHES what register() expects!");
            console.log("");
            console.log("The contract's makeCommitment() function calculates it differently");
            console.log("than we do with abi.encode()!");
        }
    } catch (error) {
        console.log("Error calling makeCommitment:", error.message);
    }
}

main().catch(console.error);
