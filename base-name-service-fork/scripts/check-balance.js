const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const balance = await ethers.provider.getBalance(deployer.address);
    
    console.log("Deployer address:", deployer.address);
    console.log("Balance:", ethers.formatEther(balance), "ETH");
    
    if (balance < ethers.parseEther("0.05")) {
        console.log("⚠️  WARNING: Low balance! Deployment may fail.");
        console.log("Recommended: At least 0.05 ETH for deployment");
    } else {
        console.log("✅ Sufficient balance for deployment");
    }
}

main().catch(console.error);
