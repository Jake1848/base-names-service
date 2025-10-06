const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Authorizing ControllerV2 on RegistrarV2...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  const config = {
    "base-sepolia": {
      registrarV2: "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6", // NEW: Fixed registrar
      controllerV2: "0x8E3132Ce6649627a8Cd5372F4a5Ebf553df5eaf6" // NEW: Fixed controller
    },
    base: {
      registrarV2: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      controllerV2: "0xa4E75471F83Fd718Dd1CB4ca6B24cAcf46F0fa34"
    }
  };

  const networkConfig = config[network];
  if (!networkConfig) {
    throw new Error(`No configuration for network: ${network}`);
  }

  console.log("Registrar V2:", networkConfig.registrarV2);
  console.log("Controller V2:", networkConfig.controllerV2);
  console.log("");

  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(networkConfig.registrarV2);

  console.log("📝 Adding controller...");
  const tx = await v2.addController(networkConfig.controllerV2);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Controller authorized!");
  console.log("");

  // Verify
  const isController = await v2.isController(networkConfig.controllerV2);
  console.log("Verified:", isController ? "✅ YES" : "❌ NO");
  console.log("");
  console.log("Now you can register domains through the frontend!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
