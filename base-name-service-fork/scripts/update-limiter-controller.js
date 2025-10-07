const hre = require("hardhat");

async function main() {
  const limiterAddress = "0x823262c6F3283Ac4901f704769aAD39FE6888c27";
  const newControllerAddress = "0x9A2cf9387d74bBa208406DC98Ba3EEE3449a17ed";

  console.log("\n🔧 Updating RegistrationLimiter controller...\n");
  console.log("Limiter:", limiterAddress);
  console.log("New controller:", newControllerAddress);
  console.log("");

  const Limiter = await hre.ethers.getContractAt(
    ["function controller() view returns (address)",
     "function setController(address) external"],
    limiterAddress
  );

  console.log("📝 Setting controller...");
  const tx = await Limiter.setController(newControllerAddress);
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("✅ Updated!");

  const newController = await Limiter.controller();
  console.log("\nVerification:");
  console.log("New controller:", newController);
  console.log("Match:", newController.toLowerCase() === newControllerAddress.toLowerCase() ? "✅" : "❌");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
