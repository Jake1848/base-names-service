const { ethers } = require("ethers");

async function main() {
    console.log("\n🔍 Analyzing Latest Transaction Failure\n");

    const commitmentFromStep1 = "0x8bd2b3baa007b83c769736fb37dcab720ff9fd7f5b3ec89bbc317f93ef88a369";
    
    const inputData = "0xdc3d72c500000000000000000000000000000000000000000000000000000000000001200000000000000000000000005a66231663d22d7eeee6e2a4781050076e8a38760000000000000000000000000000000000000000000000000000000001e1338016a1d6ec6298484f8ee4b0204f411be3b3a65860a232381b11888fadd81e88f10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000016000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000046a616b65000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000";

    console.log("Commitment from Step 1:", commitmentFromStep1);
    console.log("");

    const iface = new ethers.Interface([
        "function register(string label, address owner, uint256 duration, bytes32 secret, address resolver, bytes[] data, bool reverseRecord, bytes32 referrer, uint256 fuses) payable"
    ]);

    const decoded = iface.parseTransaction({ data: inputData });
    
    console.log("Decoded register() parameters:");
    console.log("  label:", decoded.args[0]);
    console.log("  owner:", decoded.args[1]);
    console.log("  duration:", decoded.args[2].toString());
    console.log("  secret:", decoded.args[3]);
    console.log("  resolver:", decoded.args[4]);
    console.log("  data:", decoded.args[5]);
    console.log("  reverseRecord:", decoded.args[6]);
    console.log("  referrer:", decoded.args[7]);
    console.log("  fuses:", decoded.args[8].toString());
    console.log("");

    const types = ["string","address","uint256","bytes32","address","bytes[]","bool","bytes32","uint256"];
    const values = [decoded.args[0],decoded.args[1],decoded.args[2],decoded.args[3],decoded.args[4],decoded.args[5],decoded.args[6],decoded.args[7],decoded.args[8]];

    const encoded = ethers.AbiCoder.defaultAbiCoder().encode(types, values);
    const calculatedCommitment = ethers.keccak256(encoded);

    console.log("Commitment that register() expects:", calculatedCommitment);
    console.log("Commitment we stored in Step 1:  ", commitmentFromStep1);
    console.log("");

    if (calculatedCommitment === commitmentFromStep1) {
        console.log("✅ HASHES MATCH!");
    } else {
        console.log("❌ HASHES DON'T MATCH!");
    }

    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    
    const controllerAbi = ["function commitments(bytes32) view returns (uint256)"];
    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);
    
    const timestamp1 = await controller.commitments(commitmentFromStep1);
    const timestamp2 = await controller.commitments(calculatedCommitment);

    console.log("");
    console.log("Commitment from Step 1 timestamp:", timestamp1.toString());
    console.log("Calculated commitment timestamp:  ", timestamp2.toString());
    
    if (timestamp1.toString() !== "0") console.log("✅ Step 1 commitment EXISTS!");
    if (timestamp2.toString() !== "0") console.log("✅ Calculated commitment EXISTS!");
}

main().catch(console.error);
