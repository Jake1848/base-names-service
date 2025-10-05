const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');

async function main() {
    console.log("\n🔄 Transferring .base ownership to new registrar\n");

    const [deployer] = await ethers.getSigners();
    console.log("Signer:", deployer.address);

    const ensAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const oldRegistrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const newRegistrarAddress = "0xDE42a2c46eBe0878474F1889180589393ed11841";
    const baseNode = namehash.hash('base');

    console.log("ENS Registry:", ensAddress);
    console.log("Old Registrar:", oldRegistrarAddress);
    console.log("New Registrar:", newRegistrarAddress);
    console.log(".base node:", baseNode);

    // Get ENS contract
    const ensAbi = [
        "function owner(bytes32 node) view returns (address)",
        "function setOwner(bytes32 node, address owner)"
    ];
    const ens = await ethers.getContractAt(ensAbi, ensAddress);

    // Check current owner
    const currentOwner = await ens.owner(baseNode);
    console.log("\nCurrent .base owner:", currentOwner);

    if (currentOwner === newRegistrarAddress) {
        console.log("✅ New registrar already owns .base!");
        return;
    }

    // We need to transfer from old registrar to new registrar
    // The old registrar contract owns .base, so we need to make it call setOwner
    // But the old registrar doesn't have a function for that!

    // Check if we own the old registrar
    const oldRegistrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        oldRegistrarAddress
    );

    const oldRegistrarOwner = await oldRegistrar.owner();
    console.log("Old registrar owner:", oldRegistrarOwner);

    if (oldRegistrarOwner !== deployer.address) {
        console.log("❌ You don't own the old registrar!");
        return;
    }

    // Strategy: The old BaseRegistrar has `reclaim()` function but it won't help
    // We need to directly transfer .base in ENS Registry
    // Since the old registrar IS a contract, we'd need to add a function to it

    // Alternative: Deploy a minimal proxy that can call ens.setOwner on behalf of old registrar
    // But that requires old registrar to approve the proxy

    // Simplest solution: Use the ENS Registry's setSubnodeOwner if we have permission
    // Or add a function to old registrar and redeploy (not ideal)

    console.log("\n⚠️  The old registrar is a contract that owns .base");
    console.log("We need to make it transfer ownership to the new registrar");
    console.log("\nOption 1: Add a transferOwnership function to old registrar (requires redeployment)");
    console.log("Option 2: Use a proxy contract that old registrar approves");
    console.log("Option 3: Transfer .base using ENS Registry if deployer has root access");

    // Check if deployer owns the root node
    const rootNode = ethers.ZeroHash;
    const rootOwner = await ens.owner(rootNode);
    console.log("\nRoot node owner:", rootOwner);

    if (rootOwner === deployer.address) {
        console.log("✅ You own the root! You can transfer .base directly");
        console.log("\nTransferring .base to new registrar...");
        const tx = await ens.setOwner(baseNode, newRegistrarAddress);
        await tx.wait();
        console.log("✅ Transferred!");

        // Verify
        const newOwner = await ens.owner(baseNode);
        console.log("New .base owner:", newOwner);
        console.log("Success:", newOwner === newRegistrarAddress ? "✅" : "❌");
    } else {
        console.log("❌ You don't own the root node");
        console.log("\nYou need to either:");
        console.log("1. Get access to the root owner account");
        console.log("2. Get access to an account that the old registrar approved");
        console.log("3. Add a function to BaseRegistrar to transfer .base ownership");
    }
}

main().catch(console.error);
