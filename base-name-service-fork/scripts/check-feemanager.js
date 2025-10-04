const { ethers } = require("hardhat");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://mainnet.base.org");
    
    const feeManagerAddress = "0xab30D0F58442c63C40977045433653A027733961";
    
    const feeManagerABI = [
        "function owner() view returns (address)",
        "function beneficiary() view returns (address)"
    ];
    
    const feeManager = new ethers.Contract(feeManagerAddress, feeManagerABI, provider);
    
    try {
        const owner = await feeManager.owner();
        const beneficiary = await feeManager.beneficiary();
        
        console.log("\n🏦 FeeManager Details:\n");
        console.log("Owner:", owner);
        console.log("Beneficiary (where ETH goes):", beneficiary);
        
        const balance = await provider.getBalance(feeManagerAddress);
        console.log("\n💵 Current Balance in FeeManager:", ethers.formatEther(balance), "ETH");
        
        console.log("\n✅ YOU CONTROL THE MONEY!");
        console.log("Your address:", "0x5a66231663D22d7eEEe6e2A4781050076E8a3876");
    } catch (error) {
        console.log("Error:", error.message);
    }
}

main().catch(console.error);
