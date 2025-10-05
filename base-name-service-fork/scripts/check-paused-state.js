const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔍 Checking Controller Paused State\n");
    console.log("Controller:", controllerAddress);
    console.log("");

    const controllerAbi = [
        "function paused() view returns (bool)"
    ];

    const controller = new ethers.Contract(controllerAddress, controllerAbi, provider);

    try {
        const isPaused = await controller.paused();
        console.log("Paused:", isPaused ? "❌ YES (THIS IS THE PROBLEM!)" : "✅ NO");

        if (isPaused) {
            console.log("");
            console.log("The controller is PAUSED!");
            console.log("No registrations can be processed while paused.");
            console.log("The contract owner needs to unpause it.");
        }
    } catch (error) {
        console.log("Error checking paused state:", error.message);
        console.log("Contract might not have pause functionality");
    }
}

main().catch(console.error);
