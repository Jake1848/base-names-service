const { ethers } = require("hardhat");

async function main() {
    const limiter = await ethers.getContractAt(
        "RegistrationLimiter",
        "0x823262c6F3283Ac4901f704769aAD39FE6888c27"
    );
    
    const newController = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const oldController = await limiter.controller();
    
    console.log("Old controller:", oldController);
    console.log("New controller:", newController);
    
    console.log("\nUpdating controller in RegistrationLimiter...");
    const tx = await limiter.setController(newController);
    await tx.wait();
    console.log("✅ Controller updated!");
    
    const currentController = await limiter.controller();
    console.log("Current controller:", currentController);
}

main().catch(console.error);
