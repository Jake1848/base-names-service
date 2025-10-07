const hre = require("hardhat");

async function main() {
  const controllerAddress = "0x8E3132Ce6649627a8Cd5372F4a5Ebf553df5eaf6";
  
  console.log("\n🔍 Checking Controller Configuration...\n");
  console.log("Controller:", controllerAddress);
  console.log("");

  const Controller = await hre.ethers.getContractFactory("ETHRegistrarControllerV2");
  const controller = Controller.attach(controllerAddress);

  try {
    const minCommitmentAge = await controller.minCommitmentAge();
    console.log("Min commitment age:", minCommitmentAge.toString());

    const maxCommitmentAge = await controller.maxCommitmentAge();
    console.log("Max commitment age:", maxCommitmentAge.toString());

    const prices = await controller.prices();
    console.log("Price oracle:", prices);

    const ens = await controller.ens();
    console.log("ENS registry:", ens);

    const reverseRegistrar = await controller.reverseRegistrar();
    console.log("Reverse registrar:", reverseRegistrar);

    const defaultReverseRegistrar = await controller.defaultReverseRegistrar();
    console.log("Default reverse registrar:", defaultReverseRegistrar);

    const registrationLimiter = await controller.registrationLimiter();
    console.log("Registration limiter:", registrationLimiter);

    const feeManager = await controller.feeManager();
    console.log("Fee manager:", feeManager);

  } catch (error) {
    console.log("Error:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
