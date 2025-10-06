const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying ETHRegistrarControllerV2...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  // Network-specific configuration
  const config = {
    "base-sepolia": {
      registrarV2: "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6", // FIXED: New registrar with correct baseNode
      priceOracle: "0x83eF9752EE4f706Ce1f6aa3D32fA1f9f07c2baEb",
      ensRegistry: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      reverseRegistrar: "0xC97018De65cDD20c6e9d264316139efA747b2E7A",
      // We'll need to get these addresses or deploy them
      defaultReverseRegistrar: "0x0000000000000000000000000000000000000000", // Placeholder
      registrationLimiter: "0x0000000000000000000000000000000000000000", // Placeholder
      feeManager: "0x0000000000000000000000000000000000000000" // Placeholder
    },
    base: {
      registrarV2: "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca", // FIXED: New registrar with correct baseNode
      priceOracle: "0xA1805458A1C1294D53eBBBd025B397F89Dd963AC",
      ensRegistry: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
      reverseRegistrar: "0xD982f3bFf21dCb9421ffBC2000Cfe3C94A01c889",
      defaultReverseRegistrar: "0x48325DC9aF4b6F04269A5370C94138074449Fd9f",
      registrationLimiter: "0x1376A3C0403cabeE7Da7D2BaC6266F94D1BBB64B",
      feeManager: "0xab30D0F58442c63C40977045433653A027733961"
    }
  };

  const networkConfig = config[network];
  if (!networkConfig) {
    throw new Error(`No configuration for network: ${network}`);
  }

  console.log("Configuration:");
  console.log("- Registrar V2:", networkConfig.registrarV2);
  console.log("- Price Oracle:", networkConfig.priceOracle);
  console.log("- ENS Registry:", networkConfig.ensRegistry);
  console.log("");

  // Constructor parameters
  const minCommitmentAge = 60; // 60 seconds
  const maxCommitmentAge = 86400; // 24 hours

  console.log("📝 Deploying ControllerV2...");
  const ControllerV2 = await hre.ethers.getContractFactory("ETHRegistrarControllerV2");

  const controllerV2 = await ControllerV2.deploy(
    networkConfig.registrarV2,
    networkConfig.priceOracle,
    minCommitmentAge,
    maxCommitmentAge,
    networkConfig.reverseRegistrar,
    networkConfig.defaultReverseRegistrar,
    networkConfig.ensRegistry,
    networkConfig.registrationLimiter,
    networkConfig.feeManager
  );

  await controllerV2.waitForDeployment();
  const controllerAddress = await controllerV2.getAddress();

  console.log("✅ ControllerV2 deployed to:", controllerAddress);
  console.log("");

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...");
  await controllerV2.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");
  console.log("");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network,
    controllerV2: controllerAddress,
    registrarV2: networkConfig.registrarV2,
    priceOracle: networkConfig.priceOracle,
    minCommitmentAge,
    maxCommitmentAge,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const filename = `deployments/controller-v2-${network}.json`;
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));

  console.log("═══════════════════════════════════════════════════════");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("Network:", network);
  console.log("ControllerV2:", controllerAddress);
  console.log("RegistrarV2:", networkConfig.registrarV2);
  console.log("");
  console.log("🔧 NEXT STEPS:");
  console.log("");
  console.log("1. Authorize controller on registrar:");
  console.log(`   await registrarV2.addController("${controllerAddress}")`);
  console.log("");
  console.log("2. Update frontend:");
  console.log(`   BaseController: "${controllerAddress}"`);
  console.log("");
  console.log("3. Test registration");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("💾 Deployment info saved to:", filename);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
