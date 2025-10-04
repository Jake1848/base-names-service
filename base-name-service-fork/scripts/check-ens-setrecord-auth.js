const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const ensAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const baseNode = ethers.namehash("base");

    console.log("\n🔍 Checking ENS setRecord Authorization\n");
    console.log("ENS Registry:", ensAddress);
    console.log("Controller:", controllerAddress);
    console.log(".base node:", baseNode);

    const ensAbi = [
        "function isApprovedForAll(address owner, address operator) view returns (bool)",
        "function owner(bytes32 node) view returns (address)"
    ];

    const ens = new ethers.Contract(ensAddress, ensAbi, provider);

    const baseOwner = await ens.owner(baseNode);
    console.log(".base owner:", baseOwner);

    // Check if controller is approved
    const isApproved = await ens.isApprovedForAll(baseOwner, controllerAddress);

    console.log("\nController approved for baseOwner:", isApproved);

    if (!isApproved) {
        console.log("\n❌ THIS IS THE PROBLEM!");
        console.log("The controller is NOT approved to call setRecord on behalf of the BaseRegistrar!");
        console.log("\nYou need to run (from BaseRegistrar owner):");
        console.log(`ens.setApprovalForAll("${controllerAddress}", true)`);
    } else {
        console.log("\n✅ Controller is approved");
    }
}

main().catch(console.error);
