const hre = require("hardhat");

async function main() {
  // Old controller from testnet
  const oldControllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";
  
  console.log("Old Controller:", oldControllerAddress);

  const Controller = await hre.ethers.getContractFactory("ETHRegistrarController");
  const controller = Controller.attach(oldControllerAddress);

  try {
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
