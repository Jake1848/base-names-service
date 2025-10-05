const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const limiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const userAddress = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";

    console.log("\n🔍 Detailed Registration Limiter Check\n");
    console.log("Limiter:", limiterAddress);
    console.log("Controller:", controllerAddress);
    console.log("User:", userAddress);
    console.log("");

    const limiterAbi = [
        "function controller() view returns (address)",
        "function maxRegistrationsPerWindow() view returns (uint256)",
        "function timeWindow() view returns (uint256)",
        "function canRegister(address user) view returns (bool)",
        "function registrations(address user) view returns (uint256 count, uint256 windowStart)",
        "function owner() view returns (address)"
    ];

    const limiter = new ethers.Contract(limiterAddress, limiterAbi, provider);

    // 1. Check configuration
    console.log("1️⃣ Limiter Configuration:");
    try {
        const controller = await limiter.controller();
        console.log("  Configured controller:", controller);
        console.log("  Matches expected:", controller === controllerAddress ? "✅" : "❌");
    } catch (error) {
        console.log("  Error getting controller:", error.message);
    }

    try {
        const maxRegs = await limiter.maxRegistrationsPerWindow();
        console.log("  Max registrations per window:", maxRegs.toString());
    } catch (error) {
        console.log("  Error getting max registrations:", error.message);
    }

    try {
        const timeWindow = await limiter.timeWindow();
        console.log("  Time window:", timeWindow.toString(), "seconds");
        console.log("  Time window (hours):", Number(timeWindow) / 3600);
    } catch (error) {
        console.log("  Error getting time window:", error.message);
    }

    try {
        const owner = await limiter.owner();
        console.log("  Owner:", owner);
    } catch (error) {
        console.log("  Error getting owner:", error.message);
    }

    // 2. Check user status
    console.log("\n2️⃣ User Registration Status:");
    try {
        const regData = await limiter.registrations(userAddress);
        console.log("  Registration count:", regData.count.toString());
        console.log("  Window start:", regData.windowStart.toString());

        const now = Math.floor(Date.now() / 1000);
        const windowAge = now - Number(regData.windowStart);
        console.log("  Window age:", windowAge, "seconds");
    } catch (error) {
        console.log("  Error getting registrations:", error.message);
    }

    try {
        const canRegister = await limiter.canRegister(userAddress);
        console.log("  Can register:", canRegister ? "✅ YES" : "❌ NO");
    } catch (error) {
        console.log("  Error calling canRegister:", error.message);
    }

    // 3. Try calling from controller context
    console.log("\n3️⃣ Simulating Controller Call:");
    const limiterWithInterface = new ethers.Contract(
        limiterAddress,
        ["function canRegister(address user) view returns (bool)"],
        provider
    );

    try {
        // This should be called by the controller, but we'll simulate
        const result = await limiterWithInterface.canRegister(userAddress);
        console.log("  Direct canRegister() result:", result);
    } catch (error) {
        console.log("  ❌ Direct call failed:", error.message);
        console.log("");
        console.log("  This might be why registration is failing!");
        console.log("  The limiter contract might have access control or be misconfigured");
    }
}

main().catch(console.error);
