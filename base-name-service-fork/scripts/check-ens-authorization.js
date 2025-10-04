const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const ensRegistryAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";

    console.log("\n🔍 Checking ENS Registry Authorization\n");

    const ensAbi = [
        "function owner(bytes32) view returns (address)"
    ];

    const ens = new ethers.Contract(ensRegistryAddress, ensAbi, provider);

    // Check ownership of .base node (0x0 for root, or specific namehash for .base)
    const baseNode = ethers.namehash("base");
    console.log(".base node:", baseNode);

    const baseOwner = await ens.owner(baseNode);
    console.log(".base owner:", baseOwner);
    console.log("Registrar:", registrarAddress);
    console.log("Controller:", controllerAddress);

    if (baseOwner.toLowerCase() === registrarAddress.toLowerCase()) {
        console.log("\n✅ .base is owned by BaseRegistrar");
    } else {
        console.log("\n❌ .base is NOT owned by BaseRegistrar!");
        console.log("This could cause issues!");
    }

    // Check for jake.base specifically
    const jakeNode = ethers.namehash("jake.base");
    console.log("\njake.base node:", jakeNode);

    const jakeOwner = await ens.owner(jakeNode);
    console.log("jake.base owner:", jakeOwner);

    if (jakeOwner === ethers.ZeroAddress) {
        console.log("✅ jake.base has no owner (available)");
    } else {
        console.log("❌ jake.base is owned by:", jakeOwner);
    }
}

main().catch(console.error);
