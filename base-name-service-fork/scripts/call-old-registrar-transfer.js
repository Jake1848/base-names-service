const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔄 Calling old registrar to transfer .base ownership\n");

    const [deployer] = await ethers.getSigners();
    console.log("Signer:", deployer.address);

    const oldRegistrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const newRegistrarAddress = "0xDE42a2c46eBe0878474F1889180589393ed11841";

    console.log("Old Registrar:", oldRegistrarAddress);
    console.log("New Registrar:", newRegistrarAddress);

    // Try to call the new function we added
    const registrarAbi = [
        "function transferBaseNodeOwnership(address newOwner) external",
        "function owner() view returns (address)"
    ];

    const oldRegistrar = await ethers.getContractAt(registrarAbi, oldRegistrarAddress);

    // Check ownership
    const owner = await oldRegistrar.owner();
    console.log("Old registrar owner:", owner);

    if (owner !== deployer.address) {
        console.log("❌ You don't own the old registrar!");
        return;
    }

    console.log("\nAttempting to call transferBaseNodeOwnership...");

    try {
        const tx = await oldRegistrar.transferBaseNodeOwnership(newRegistrarAddress);
        await tx.wait();
        console.log("✅ Successfully transferred!");
        console.log("TX:", tx.hash);
    } catch (error) {
        console.log("❌ Failed:", error.message);
        console.log("\nThe old contract doesn't have this function.");
        console.log("We need to use the ENS Registry's setApprovalForAll to approve ourselves");
        console.log("and then transfer using an approved account.");
    }
}

main().catch(console.error);
