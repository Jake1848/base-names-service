const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const domain = "jake";
    const owner = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
    const secret = "0x643b9c2a9c71d5fe8a8d6485d9ee22111f6bb6a405690e9c6e887205d85e6fdf"; // From console
    const duration = BigInt(365 * 24 * 60 * 60);
    const resolver = "0x2927556a0761d6E4A6635CBE9988747625dAe125";

    console.log("\n🔍 Checking commitment for jake.base\n");
    console.log("Secret:", secret);

    // Compute commitment hash the way the contract does
    // Using abi.encode of the Registration struct
    const commitment = ethers.keccak256(
        ethers.AbiCoder.defaultAbiCoder().encode(
            ["string", "address", "uint256", "bytes32", "address", "bytes[]", "uint256", "bytes32"],
            [
                domain,
                owner,
                duration,
                secret,
                resolver,
                [],
                BigInt(0), // reverseRecord: false = 0
                ethers.ZeroHash // referrer
            ]
        )
    );

    console.log("Computed commitment:", commitment);

    // Check if this commitment exists in the contract
    const controllerAbi = [
        "function commitments(bytes32) view returns (uint256)"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    const commitmentTimestamp = await controller.commitments(commitment);

    console.log("\nCommitment timestamp:", commitmentTimestamp.toString());

    if (commitmentTimestamp > 0) {
        const now = Math.floor(Date.now() / 1000);
        const age = now - Number(commitmentTimestamp);

        console.log("Current time:", now);
        console.log("Commitment age:", age, "seconds");
        console.log("Commitment made:", new Date(Number(commitmentTimestamp) * 1000).toLocaleString());

        if (age >= 60) {
            console.log("✅ Commitment is old enough (>= 60 seconds)");
        } else {
            console.log("❌ Commitment is too young. Wait", 60 - age, "more seconds");
        }

        if (age <= 86400) {
            console.log("✅ Commitment is still valid (< 24 hours)");
        } else {
            console.log("❌ Commitment expired (> 24 hours old)");
        }

        if (age >= 60 && age <= 86400) {
            console.log("\n🎉 READY TO REGISTER!");
        }
    } else {
        console.log("❌ NO COMMITMENT FOUND!");
        console.log("\nThis means either:");
        console.log("1. The commitment was never made");
        console.log("2. The commitment hash is computed incorrectly");
        console.log("3. The secret doesn't match what was used in commit()");
    }
}

main().catch(console.error);
