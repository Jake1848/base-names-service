const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const commitmentHash = "0xbc8a887be8aee93b79557ba5ffe25d061d31f7eb2a0753922863ef8c7abda5d0";

    console.log("\n🔍 Checking commitment on-chain\n");
    console.log("Commitment hash:", commitmentHash);

    const controllerAbi = [
        "function commitments(bytes32) view returns (uint256)"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    const commitmentTimestamp = await controller.commitments(commitmentHash);

    console.log("\nCommitment timestamp:", commitmentTimestamp.toString());

    if (commitmentTimestamp > 0) {
        const now = Math.floor(Date.now() / 1000);
        const age = now - Number(commitmentTimestamp);

        console.log("Current time:", now);
        console.log("Commitment age:", age, "seconds");
        console.log("Commitment made at:", new Date(Number(commitmentTimestamp) * 1000).toLocaleString());

        console.log("\n✅ COMMITMENT EXISTS!");

        if (age >= 60) {
            console.log("✅ Old enough (>= 60 seconds)");
        } else {
            console.log("❌ Too young. Need to wait", 60 - age, "more seconds");
        }

        if (age <= 86400) {
            console.log("✅ Still valid (< 24 hours)");
        } else {
            console.log("❌ Expired (> 24 hours old)");
        }
    } else {
        console.log("\n❌ COMMITMENT NOT FOUND ON-CHAIN!");
        console.log("\nThis means the commit() transaction might have:");
        console.log("  1. Failed");
        console.log("  2. Not been mined yet");
        console.log("  3. Been deleted (already used)");
    }

    // Check if domain is available
    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("Checking if jake.base is available...");

    const registrarAbi = [
        "function available(uint256) view returns (bool)"
    ];

    const registrar = new ethers.Contract(
        "0x69b81319958388b5133DF617Ba542FB6c9e03177",
        registrarAbi,
        provider
    );

    const tokenId = ethers.keccak256(ethers.toUtf8Bytes("jake"));
    const available = await registrar.available(tokenId);

    console.log("Available:", available);

    if (!available) {
        console.log("❌ Domain is already registered!");
        console.log("This would cause the transaction to fail.");
    } else {
        console.log("✅ Domain is available");
    }
}

main().catch(console.error);
