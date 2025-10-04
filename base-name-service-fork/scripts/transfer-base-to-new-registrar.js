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

    // Get old registrar contract
    const oldRegistrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        oldRegistrarAddress
    );

    // Check if we own the old registrar
    const owner = await oldRegistrar.owner();
    console.log("\nOld registrar owner:", owner);
    console.log("Our address:", deployer.address);

    if (owner !== deployer.address) {
        console.log("❌ You don't own the old registrar");
        process.exit(1);
    }

    // The old registrar currently owns .base in ENS
    // We need to call ens.setOwner from the old registrar
    // But old registrar doesn't have that function exposed!

    console.log("\n⚠️  The old BaseRegistrar doesn't have a function to call ens.setOwner()");
    console.log("We need to use the ENS Registry's reclaim mechanism or transfer directly");

    // Alternative: Since deployer is the owner of the old registrar contract,
    // we can call ens.setOwner directly if deployer has permission

    const ensAbi = [
        "function owner(bytes32 node) view returns (address)",
        "function setOwner(bytes32 node, address owner)"
    ];
    const ens = await ethers.getContractAt(ensAbi, ensAddress);

    const currentBaseOwner = await ens.owner(baseNode);
    console.log("\nCurrent .base owner in ENS:", currentBaseOwner);

    if (currentBaseOwner === oldRegistrarAddress) {
        console.log("\n❌ The old registrar owns .base in ENS");
        console.log("We need to make the old registrar call ens.setOwner()");
        console.log("But the old registrar contract doesn't expose this!");
        console.log("\nSolution: Deploy a new controller that points to the new registrar instead");
    } else if (currentBaseOwner === deployer.address) {
        console.log("\n✅ Deployer owns .base, transferring to new registrar...");
        const tx = await ens.setOwner(baseNode, newRegistrarAddress);
        await tx.wait();
        console.log("✅ Transferred!");
    }
}

main().catch(console.error);
