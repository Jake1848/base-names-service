const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');

async function main() {
    console.log("\n🔄 Transferring .base ownership via approval mechanism\n");

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

    // Step 1: Have the old registrar approve the deployer in ENS Registry
    console.log("\n1️⃣ Approving deployer in ENS Registry (via old registrar)...");

    const oldRegistrarAbi = [
        "function approveOperatorInENS(address operator, bool approved) external"
    ];

    const oldRegistrar = await ethers.getContractAt(oldRegistrarAbi, oldRegistrarAddress);

    try {
        const tx1 = await oldRegistrar.approveOperatorInENS(deployer.address, true);
        await tx1.wait();
        console.log("✅ Deployer approved!");
        console.log("TX:", tx1.hash);
    } catch (error) {
        console.log("❌ Old registrar doesn't have approveOperatorInENS function");
        console.log("This means the old registrar is the original version without our upgrades");
        console.log("\nAlternative: We'll need to use setApprovalForAll if it exists");

        // Try the standard ERC721 setApprovalForAll
        const oldRegistrarERC721Abi = [
            "function setApprovalForAll(address operator, bool approved) external"
        ];
        const oldRegistrarERC721 = await ethers.getContractAt(oldRegistrarERC721Abi, oldRegistrarAddress);

        try {
            console.log("\nTrying ERC721 setApprovalForAll...");
            const tx1b = await oldRegistrarERC721.setApprovalForAll(deployer.address, true);
            await tx1b.wait();
            console.log("✅ Approved via ERC721!");
        } catch (error2) {
            console.log("❌ Also failed:", error2.message);
            console.log("\nThe old registrar doesn't expose any way to approve operators in ENS");
            console.log("This is the architectural limitation.");
            return;
        }
    }

    // Step 2: Use deployer to transfer .base ownership
    console.log("\n2️⃣ Transferring .base ownership from deployer...");

    const ensAbi = [
        "function setOwner(bytes32 node, address owner) external",
        "function isApprovedForAll(address owner, address operator) view returns (bool)"
    ];

    const ens = await ethers.getContractAt(ensAbi, ensAddress);

    // Verify approval first
    const isApproved = await ens.isApprovedForAll(oldRegistrarAddress, deployer.address);
    console.log("Deployer approved by old registrar:", isApproved);

    if (!isApproved) {
        console.log("❌ Deployer is not approved - cannot transfer");
        return;
    }

    console.log("Transferring .base to new registrar...");
    const tx2 = await ens.setOwner(baseNode, newRegistrarAddress);
    await tx2.wait();
    console.log("✅ Transferred!");
    console.log("TX:", tx2.hash);

    // Step 3: Verify
    console.log("\n3️⃣ Verifying...");
    const newOwner = await ens.owner(baseNode);
    console.log("New .base owner:", newOwner);
    console.log("Success:", newOwner === newRegistrarAddress ? "✅" : "❌");
}

main().catch(console.error);
