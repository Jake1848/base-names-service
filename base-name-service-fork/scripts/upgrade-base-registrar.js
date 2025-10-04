const { ethers } = require("hardhat");
const namehash = require('eth-ens-namehash');

async function main() {
    console.log("\n🔄 Upgrading BaseRegistrar on Base Sepolia\n");

    const [deployer] = await ethers.getSigners();
    console.log("Deploying with:", deployer.address);

    // Existing addresses
    const ensAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const oldRegistrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("ENS Registry:", ensAddress);
    console.log("Old Registrar:", oldRegistrarAddress);
    console.log("Controller:", controllerAddress);

    // 1. Deploy new BaseRegistrar
    console.log("\n1. Deploying new BaseRegistrar with approveOperatorInENS function...");
    const BaseRegistrar = await ethers.getContractFactory("BaseRegistrarImplementation");
    const baseNode = namehash.hash('base');
    const newRegistrar = await BaseRegistrar.deploy(ensAddress, baseNode);
    await newRegistrar.waitForDeployment();
    const newRegistrarAddress = await newRegistrar.getAddress();
    console.log("✅ New BaseRegistrar deployed to:", newRegistrarAddress);

    // 2. Transfer ownership of .base node in ENS from old to new registrar
    console.log("\n2. Transferring .base ownership in ENS Registry...");
    const ensAbi = [
        "function owner(bytes32 node) view returns (address)",
        "function setOwner(bytes32 node, address owner)"
    ];
    const ens = await ethers.getContractAt(ensAbi, ensAddress);

    const currentOwner = await ens.owner(baseNode);
    console.log("Current .base owner:", currentOwner);

    if (currentOwner === oldRegistrarAddress) {
        console.log("⚠️  Cannot transfer - old registrar owns .base");
        console.log("You need to transfer from the deployer or current owner");
        console.log("\nIf deployer owns .base, run:");
        console.log(`  await ens.setOwner("${baseNode}", "${newRegistrarAddress}")`);
    } else if (currentOwner === deployer.address) {
        const tx = await ens.setOwner(baseNode, newRegistrarAddress);
        await tx.wait();
        console.log("✅ Transferred .base to new registrar");
    }

    // 3. Add controller to new registrar
    console.log("\n3. Adding controller to new registrar...");
    const tx2 = await newRegistrar.addController(controllerAddress);
    await tx2.wait();
    console.log("✅ Controller added");

    // 4. Approve controller in ENS Registry
    console.log("\n4. Approving controller in ENS Registry...");
    const tx3 = await newRegistrar.approveOperatorInENS(controllerAddress, true);
    await tx3.wait();
    console.log("✅ Controller approved in ENS!");

    // 5. Verify
    console.log("\n5. Verifying approval...");
    const ensCheckAbi = ["function isApprovedForAll(address owner, address operator) view returns (bool)"];
    const ensCheck = await ethers.getContractAt(ensCheckAbi, ensAddress);
    const isApproved = await ensCheck.isApprovedForAll(newRegistrarAddress, controllerAddress);
    console.log("Controller approved:", isApproved);

    if (isApproved) {
        console.log("\n🎉 SUCCESS! New BaseRegistrar deployed and configured!");
        console.log("\n📋 New Addresses:");
        console.log("BaseRegistrar:", newRegistrarAddress);
        console.log("\n⚠️  Update the frontend with this new address!");
    } else {
        console.log("\n❌ Approval failed - check permissions");
    }
}

main().catch(console.error);
