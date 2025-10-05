const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    
    // Parameters from the frontend logs
    const label = "jake";
    const owner = "0xF1Ec8EB4d825A4f739425bF86957f3AE4b00A0BC";
    const duration = 31536000; // 1 year in seconds
    const secret = "0x73bf88e8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4";
    const resolver = "0x0000000000000000000000000000000000000000"; // zero address
    const data = [];
    const reverseRecord = false;
    const ownerControlledFuses = 0;

    console.log("\n🔍 Verifying Commitment Hash Calculation\n");
    console.log("Parameters:");
    console.log("  label:", label);
    console.log("  owner:", owner);
    console.log("  duration:", duration);
    console.log("  secret:", secret);
    console.log("  resolver:", resolver);
    console.log("  data:", data);
    console.log("  reverseRecord:", reverseRecord);
    console.log("  ownerControlledFuses:", ownerControlledFuses);
    console.log("");

    const controllerAbi = [
        "function makeCommitment(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, uint16 ownerControlledFuses) pure returns (bytes32)"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    try {
        const calculatedHash = await controller.makeCommitment(
            label,
            owner,
            duration,
            secret,
            resolver,
            data,
            reverseRecord,
            ownerControlledFuses
        );
        
        console.log("Calculated commitment hash:", calculatedHash);
        console.log("Expected from logs:         0x441c1d58b9646d9c4f1b9184bec03cfaa32a8f8c8d264dd6934af86b6355cf2a");
        console.log("");
        
        if (calculatedHash.toLowerCase() === "0x441c1d58b9646d9c4f1b9184bec03cfaa32a8f8c8d264dd6934af86b6355cf2a".toLowerCase()) {
            console.log("✅ HASHES MATCH! Commitment calculation is correct.");
        } else {
            console.log("❌ HASHES DON'T MATCH! There's a mismatch in the commitment calculation.");
        }
    } catch (error) {
        console.log("Error calculating commitment:", error.message);
    }
}

main().catch(console.error);
