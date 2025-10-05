const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const commitmentHash = "0x441c1d58b9646d9c4f1b9184bec03cfaa32a8f8c8d264dd6934af86b6355cf2a";

    console.log("\n🔍 Checking Commitment in Contract\n");
    console.log("Controller:", controllerAddress);
    console.log("Commitment:", commitmentHash);
    console.log("");

    const controllerAbi = [
        "function commitments(bytes32) view returns (uint256)"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    try {
        const timestamp = await controller.commitments(commitmentHash);
        console.log("Commitment Timestamp:", timestamp.toString());

        if (timestamp.toString() === "0") {
            console.log("❌ COMMITMENT NOT FOUND!");
            console.log("The commitment hash was not stored in the contract.");
            console.log("This means the commit() transaction may have failed or used different parameters.");
        } else {
            const commitTime = new Date(Number(timestamp) * 1000);
            const now = new Date();
            const ageSeconds = Math.floor((now - commitTime) / 1000);

            console.log("✅ Commitment exists!");
            console.log("Committed at:", commitTime.toISOString());
            console.log("Age:", ageSeconds, "seconds");
            console.log("");

            if (ageSeconds < 60) {
                console.log("❌ TOO NEW! Must wait at least 60 seconds");
            } else if (ageSeconds > 86400) {
                console.log("❌ TOO OLD! Must register within 86400 seconds (24 hours)");
            } else {
                console.log("✅ Age is valid (between 60 and 86400 seconds)");
            }
        }
    } catch (error) {
        console.log("Error checking commitment:", error.message);
    }
}

main().catch(console.error);
