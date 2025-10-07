const hre = require("hardhat");

async function main() {
  const limiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";
  const newControllerAddress = "0x9A2cf9387d74bBa208406DC98Ba3EEE3449a17ed";
  const oldControllerAddress = "0xCD24477aFCB5D97B3B794a376d6a1De38e640564";

  console.log("\n🔍 Checking RegistrationLimiter controller...\n");

  const Limiter = await hre.ethers.getContractAt(
    ["function controller() view returns (address)",
     "function setController(address) external",
     "function owner() view returns (address)"],
    limiterAddress
  );

  const currentController = await Limiter.controller();
  const owner = await Limiter.owner();

  console.log("Limiter owner:", owner);
  console.log("Current controller:", currentController);
  console.log("Old controller:", oldControllerAddress);
  console.log("New controller:", newControllerAddress);
  console.log("");

  if (currentController.toLowerCase() === newControllerAddress.toLowerCase()) {
    console.log("✅ Already set to new controller!");
  } else if (currentController.toLowerCase() === oldControllerAddress.toLowerCase()) {
    console.log("❌ FOUND THE PROBLEM!");
    console.log("   Limiter is still pointing to OLD controller");
    console.log("   Need to update it to new controller");
  } else {
    console.log("⚠️ Limiter pointing to unexpected controller");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
