const hre = require("hardhat");

async function main() {
  const registrarV2 = "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6";
  const controllerV2 = "0x9A2cf9387d74bBa208406DC98Ba3EEE3449a17ed";

  console.log("\n🔧 Finalizing testnet deployment...\n");

  const Registrar = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrar = Registrar.attach(registrarV2);

  console.log("Authorizing controller...");
  const tx = await registrar.addController(controllerV2);
  await tx.wait();
  console.log("✅ Authorized! Hash:", tx.hash);

  const isController = await registrar.isController(controllerV2);
  console.log("Verified:", isController ? "✅" : "❌");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
