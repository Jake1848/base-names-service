const { ethers } = require("ethers");

async function main() {
    console.log("\n🔍 Analyzing Commitment Hash Mismatch\n");

    const storedCommitment = "0x441c1d58b9646d9c4f1b9184bec03cfaa32a8f8c8d264dd6934af86b6355cf2a";
    const notFoundCommitment = "0xe6be8a2078a09981432434cdb92c9844889feb6b6e3b197908b5fcdb32943403";

    console.log("Commitment stored in contract:  ", storedCommitment);
    console.log("Commitment register is looking for:", notFoundCommitment);
    console.log("");

    if (storedCommitment === notFoundCommitment) {
        console.log("✅ Commitments MATCH");
    } else {
        console.log("❌ Commitments DON'T MATCH!");
        console.log("");
        console.log("This means the register() function is calculating a DIFFERENT");
        console.log("commitment hash than the commit() function did.");
        console.log("");
        console.log("Possible causes:");
        console.log("  1. Different parameters passed to commit() vs register()");
        console.log("  2. Different function signatures for makeCommitment()");
        console.log("  3. The register() function might be using a different commitment calculation");
        console.log("");
        console.log("The register() function appears to be calculating the commitment");
        console.log("internally rather than accepting it as a parameter.");
    }

    console.log("");
    console.log("Let me check what commitment the register call would produce...");
    console.log("");

    const label = "jake";
    const owner = "0xF1Ec8EB4d825A4f739425bF86957f3AE4b00A0BC";
    const duration = 31536000;
    const secret = "0x73bf88e8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4f8c18b8c4";
    const resolver = "0x0000000000000000000000000000000000000000";
    const data = [];
    const reverseRecord = false;
    const referrer = "0x0000000000000000000000000000000000000000000000000000000000000000";
    const fuses = 0;

    console.log("Parameters used in register():");
    console.log("  label:", label);
    console.log("  owner:", owner);
    console.log("  duration:", duration);
    console.log("  secret:", secret);
    console.log("  resolver:", resolver);
    console.log("  data:", data);
    console.log("  reverseRecord:", reverseRecord);
    console.log("  referrer:", referrer);
    console.log("  fuses:", fuses);
    console.log("");

    // Calculate what the commitment should be with the NEW signature
    // The register function with 9 params might calculate commitment differently
    const types = [
        "string",  // label
        "address", // owner
        "uint256", // duration
        "bytes32", // secret
        "address", // resolver
        "bytes[]", // data
        "bool",    // reverseRecord
        "bytes32", // referrer
        "uint256"  // fuses
    ];

    const values = [label, owner, duration, secret, resolver, data, reverseRecord, referrer, fuses];
    
    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    const calculatedCommitment = ethers.keccak256(encoded);
    
    console.log("Calculated commitment (9 params):", calculatedCommitment);
    console.log("");

    if (calculatedCommitment === notFoundCommitment) {
        console.log("✅ This matches what register() is looking for!");
        console.log("");
        console.log("SOLUTION: The commit() function needs to use the SAME 9 parameters!");
        console.log("Currently commit() is using 8 parameters (old signature)");
        console.log("But register() is expecting a commitment with 9 parameters (new signature)");
    } else {
        console.log("Still doesn't match. The commitment calculation might be different.");
    }
}

main().catch(console.error);
