const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();

    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔧 Fixing ENS Approval\n");
    console.log("Registrar:", registrarAddress);
    console.log("Controller:", controllerAddress);
    console.log("Signer:", signer.address);

    const registrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        registrarAddress
    );

    console.log("\nApproving controller in BaseRegistrar's ENS permissions...");

    // BaseRegistrar needs to approve the controller to act on its behalf in ENS
    // This allows the controller to call ens.setRecord() during registration
    const tx = await registrar.setApprovalForAll(controllerAddress, true);
    await tx.wait();

    console.log("✅ Controller approved!");
    console.log("TX:", tx.hash);

    console.log("\n🎉 Done! Now registrations should work!");
}

main().catch(console.error);
