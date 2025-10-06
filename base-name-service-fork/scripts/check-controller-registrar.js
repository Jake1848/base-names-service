const hre = require("hardhat");

async function main() {
  const controllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
  
  const controller = await hre.ethers.getContractAt(
    ["function base() view returns (address)",
     "function owner() view returns (address)"],
    controllerAddress
  );

  try {
    const registrar = await controller.base();
    console.log("Controller's current registrar:", registrar);
    console.log("Should be V2:", "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9");
    console.log("Match:", registrar.toLowerCase() === "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9".toLowerCase() ? "✅" : "❌");
    console.log("");
    
    const owner = await controller.owner();
    console.log("Controller owner:", owner);
    console.log("You own it:", owner.toLowerCase() === "0x5a66231663D22d7eEEe6e2A4781050076E8a3876".toLowerCase() ? "✅" : "❌");
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
