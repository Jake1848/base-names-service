const { ethers } = require("ethers");

async function main() {
    const provider = new ethers.JsonRpcProvider("https://sepolia.base.org");

    const registrarAddress = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
    const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

    console.log("\n🔍 Checking Controller Authorization in BaseRegistrar\n");
    console.log("Registrar:", registrarAddress);
    console.log("Controller:", controllerAddress);

    const registrarAbi = [
        "function controllers(address) view returns (bool)"
    ];

    const registrar = new ethers.Contract(registrarAddress, registrarAbi, provider);

    const isAuthorized = await registrar.controllers(controllerAddress);

    console.log("\nController authorized:", isAuthorized);

    if (isAuthorized) {
        console.log("\n✅ Controller IS authorized in BaseRegistrar");
        console.log("This is NOT the problem");
    } else {
        console.log("\n❌ Controller is NOT authorized in BaseRegistrar!");
        console.log("THIS IS THE PROBLEM!");
        console.log("\nYou need to run:");
        console.log(`registrar.addController("${controllerAddress}")`);
    }
}

main().catch(console.error);
