const hre = require("hardhat");

async function main() {
  const controllerAddress = "0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8";
  
  console.log("\n🔍 Checking Mainnet Controller Configuration...\n");
  console.log("Controller:", controllerAddress);
  console.log("");

  const Controller = await hre.ethers.getContractFactory("ETHRegistrarControllerV2");
  const controller = Controller.attach(controllerAddress);

  const registrationLimiter = await controller.registrationLimiter();
  console.log("Registration limiter:", registrationLimiter);

  const feeManager = await controller.feeManager();
  console.log("Fee manager:", feeManager);

  const prices = await controller.prices();
  console.log("Price oracle:", prices);

  const ens = await controller.ens();
  console.log("ENS registry:", ens);

  // Check if registrar is authorized
  const registrarAddress = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca";
  const Registrar = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrar = Registrar.attach(registrarAddress);

  const isController = await registrar.isController(controllerAddress);
  console.log("\nController authorized on registrar:", isController ? "✅" : "❌");

  console.log("\n" + (registrationLimiter !== "0x0000000000000000000000000000000000000000" ? "✅" : "❌"), "Mainnet is", registrationLimiter !== "0x0000000000000000000000000000000000000000" ? "READY!" : "NOT READY - needs redeployment");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
