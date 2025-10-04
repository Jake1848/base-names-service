const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    // BaseController address
    const controllerAddress = "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e";
    
    const controllerABI = [
        "function owner() view returns (address)",
        "function feeManager() view returns (address)"
    ];
    
    const controller = new ethers.Contract(controllerAddress, controllerABI, provider);
    
    const owner = await controller.owner();
    const feeManager = await controller.feeManager();
    
    console.log("\n💰 ETH Payment Flow:\n");
    console.log("1️⃣  User pays ETH to BaseController:", controllerAddress);
    console.log("2️⃣  ETH accumulates in BaseController contract");
    console.log("3️⃣  Owner can withdraw to FeeManager:", feeManager);
    console.log("\n👤 Current Owner:", owner);
    console.log("🏦 FeeManager:", feeManager);
    
    const balance = await provider.getBalance(controllerAddress);
    console.log("\n💵 Current Balance in Controller:", ethers.formatEther(balance), "ETH");
}

main().catch(console.error);
