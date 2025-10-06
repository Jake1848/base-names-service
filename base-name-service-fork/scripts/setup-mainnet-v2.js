const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Setting up mainnet registrar...\n");

  const registrarV2Address = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";
  const controllerAddress = "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e";

  console.log("Registrar V2:", registrarV2Address);
  console.log("Controller:", controllerAddress);
  console.log("");

  const RegistrarV2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrarV2 = RegistrarV2.attach(registrarV2Address);

  // Add controller
  console.log("📝 Adding controller...");
  const tx = await registrarV2.addController(controllerAddress);
  console.log("Transaction hash:", tx.hash);
  await tx.wait();
  console.log("✅ Controller added!");
  console.log("");

  // Verify
  const isController = await registrarV2.isController(controllerAddress);
  console.log("Controller authorized:", isController ? "✅ YES" : "❌ NO");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
