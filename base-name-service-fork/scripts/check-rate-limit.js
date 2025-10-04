const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const limiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";
    const yourAddress = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";

    console.log("\n🔍 Checking registration rate limit\n");

    const limiterAbi = [
        "function registrations(address, uint256) view returns (uint256)",
        "function maxRegistrationsPerWindow() view returns (uint256)",
        "function timeWindow() view returns (uint256)"
    ];

    const limiter = new ethers.Contract(limiterAddress, limiterAbi, provider);

    const timeWindow = await limiter.timeWindow();
    const maxPerWindow = await limiter.maxRegistrationsPerWindow();

    const currentWindow = Math.floor(Date.now() / 1000 / Number(timeWindow));
    const currentCount = await limiter.registrations(yourAddress, currentWindow);

    console.log("Time window:", timeWindow.toString(), "seconds (", Number(timeWindow) / 3600, "hours )");
    console.log("Max registrations per window:", maxPerWindow.toString());
    console.log("Current window:", currentWindow);
    console.log("\nYour current registration count:", currentCount.toString());
    console.log("Remaining:", Number(maxPerWindow) - Number(currentCount));

    if (currentCount >= maxPerWindow) {
        console.log("\n❌ RATE LIMIT HIT!");
        console.log("You've reached the maximum registrations for this time period.");
        console.log("\nWait until the next time window or contact admin to increase limit.");

        const windowStart = currentWindow * Number(timeWindow);
        const windowEnd = windowStart + Number(timeWindow);
        const now = Math.floor(Date.now() / 1000);
        const timeUntilReset = windowEnd - now;

        console.log("\nTime until reset:", Math.floor(timeUntilReset / 3600), "hours", Math.floor((timeUntilReset % 3600) / 60), "minutes");
    } else {
        console.log("\n✅ You can still register!");
    }
}

main().catch(console.error);
