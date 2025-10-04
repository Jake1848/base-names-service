const { ethers } = require("hardhat");

async function main() {
    const registrar = await ethers.getContractAt(
        "BaseRegistrarImplementation",
        "0x69b81319958388b5133DF617Ba542FB6c9e03177"
    );
    
    const controller = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
    
    const isController = await registrar.controllers(controller);
    console.log("Is controller authorized?", isController);
    
    const owner = await registrar.owner();
    console.log("Registrar owner:", owner);
}

main().catch(console.error);
