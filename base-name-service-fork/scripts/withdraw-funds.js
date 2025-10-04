const { ethers } = require("hardhat");

async function main() {
    console.log("\n💰 Withdrawing Funds from BaseController...\n");

    const [signer] = await ethers.getSigners();
    const controllerAddress = "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e";

    // Check balance before withdrawal
    const balanceBefore = await ethers.provider.getBalance(controllerAddress);
    console.log("Balance in Controller:", ethers.formatEther(balanceBefore), "ETH");

    if (balanceBefore === 0n) {
        console.log("\n❌ No funds to withdraw!");
        return;
    }

    // Get controller contract
    const controller = await ethers.getContractAt("ETHRegistrarController", controllerAddress);

    // Verify you're the owner
    const owner = await controller.owner();
    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
        console.error("\n❌ You are not the owner!");
        console.error("Owner:", owner);
        console.error("Your address:", signer.address);
        process.exit(1);
    }

    console.log("\n✅ Confirmed: You are the owner");
    console.log("Withdrawing", ethers.formatEther(balanceBefore), "ETH to FeeManager...\n");

    // Withdraw
    const tx = await controller.withdraw();
    console.log("Transaction sent:", tx.hash);
    
    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Check balance after
    const balanceAfter = await ethers.provider.getBalance(controllerAddress);
    console.log("\n📊 Final Balance in Controller:", ethers.formatEther(balanceAfter), "ETH");
    console.log("💸 Withdrawn:", ethers.formatEther(balanceBefore - balanceAfter), "ETH");
    console.log("\n✅ Funds sent to FeeManager: 0xab30D0F58442c63C40977045433653A027733961");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ Withdrawal failed:", error);
        process.exit(1);
    });
