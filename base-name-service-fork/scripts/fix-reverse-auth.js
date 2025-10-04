const { ethers } = require("hardhat");

async function main() {
    const reverseRegistrar = await ethers.getContractAt(
        "ReverseRegistrar",
        "0xa1f10499B1D1a1c249443d82aaDA9ff7F3AE99cF"
    );
    
    const newController = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    
    console.log("Adding controller to ReverseRegistrar...");
    const tx = await reverseRegistrar.setController(newController, true);
    await tx.wait();
    console.log("✅ Controller authorized in ReverseRegistrar!");
}

main().catch(console.error);
