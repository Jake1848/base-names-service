const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();

    const ensRegistryAddress = "0x9396f642A4bDabE278D51Dad7b277Ba4151bFfAd";
    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔧 Fixing ENS Registry Approval\n");
    console.log("ENS Registry:", ensRegistryAddress);
    console.log("Registrar:", registrarAddress);
    console.log("Controller:", controllerAddress);
    console.log("Signer:", signer.address);

    // We need to approve the controller as an operator in the ENS Registry
    // This must be called FROM the BaseRegistrar contract
    const registrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        registrarAddress
    );

    // BaseRegistrarImplementation should have a function to call ENS.setApprovalForAll
    // But it doesn't expose it directly, so we need to do it from the owner

    // Actually, the BaseRegistrar itself needs to call ens.setApprovalForAll
    // Let's add a function to do this or call it directly

    const ensAbi = [
        "function setApprovalForAll(address operator, bool approved) external"
    ];

    const ens = await ethers.getContractAt(ensAbi, ensRegistryAddress);

    // The signer must be the owner of .base in the ENS registry
    // Since BaseRegistrar owns .base, we need to call this FROM the registrar

    // Let me check if we have access to do this...
    console.log("\nThis needs to be called from the BaseRegistrar contract.");
    console.log("The BaseRegistrar (0x69b81...) must approve the controller in ENS.");
    console.log("\nTrying to call ENS.setApprovalForAll from current signer...");

    try {
        // This will only work if the signer is an owner of nodes we care about
        const tx = await ens.setApprovalForAll(controllerAddress, true);
        await tx.wait();
        console.log("✅ Approval set!");
        console.log("TX:", tx.hash);
    } catch (error) {
        console.log("❌ Failed:", error.message);
        console.log("\nThe issue is that BaseRegistrar needs to approve controller in ENS,");
        console.log("but BaseRegistrar is a contract and needs a special function to do this.");
        console.log("\nWe need to add a function to BaseRegistrar like:");
        console.log("  function approveControllerInENS(address controller) external onlyOwner {");
        console.log("    ens.setApprovalForAll(controller, true);");
        console.log("  }");
    }
}

main().catch(console.error);
