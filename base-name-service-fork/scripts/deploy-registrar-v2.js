const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying BaseRegistrarImplementationV2...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  // Network-specific addresses
  const config = {
    "base-sepolia": {
      ens: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      baseNode: "0x7e7650bbd57a49caffbb4c83ce43045d2653261b7953b80d47500d9eb37b6134", // FIXED: correct namehash('base')
      metadata: "0xDb770A373c99DAcE31B8f0e456e9D97CbAed057b",
      oldRegistrar: "0x69b81319958388b5133DF617Ba542FB6c9e03177"
    },
    baseSepolia: {
      ens: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      baseNode: "0x7e7650bbd57a49caffbb4c83ce43045d2653261b7953b80d47500d9eb37b6134", // FIXED: correct namehash('base')
      metadata: "0xDb770A373c99DAcE31B8f0e456e9D97CbAed057b",
      oldRegistrar: "0x69b81319958388b5133DF617Ba542FB6c9e03177"
    },
    base: {
      ens: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
      baseNode: "0x7e7650bbd57a49caffbb4c83ce43045d2653261b7953b80d47500d9eb37b6134", // FIXED: correct namehash('base')
      metadata: "0xc30A22d048E1F9fe878b779D26c328eBAa7Bb797",
      oldRegistrar: "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917"
    }
  };

  const networkConfig = config[network];
  if (!networkConfig) {
    throw new Error(`No configuration for network: ${network}`);
  }

  console.log("ENS Registry:", networkConfig.ens);
  console.log("Base Node:", networkConfig.baseNode);
  console.log("Metadata Contract:", networkConfig.metadata);
  console.log("Old Registrar:", networkConfig.oldRegistrar);
  console.log("");

  // Deploy V2 Registrar
  const BaseRegistrarV2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrarV2 = await BaseRegistrarV2.deploy(
    networkConfig.ens,
    networkConfig.baseNode,
    networkConfig.metadata
  );

  await registrarV2.waitForDeployment();
  const registrarAddress = await registrarV2.getAddress();

  console.log("✅ BaseRegistrarImplementationV2 deployed to:", registrarAddress);
  console.log("");

  // Wait for confirmations
  console.log("⏳ Waiting for block confirmations...");
  await registrarV2.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");
  console.log("");

  // Verify on BaseScan
  if (network !== "hardhat" && network !== "localhost") {
    console.log("📝 Verifying contract on BaseScan...");
    console.log("⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: registrarAddress,
        constructorArguments: [
          networkConfig.ens,
          networkConfig.baseNode,
          networkConfig.metadata
        ],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("You can verify manually later with:");
      console.log(`npx hardhat verify --network ${network} ${registrarAddress} ${networkConfig.ens} ${networkConfig.baseNode} ${networkConfig.metadata}`);
    }
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Network:", network);
  console.log("New Registrar V2:", registrarAddress);
  console.log("Old Registrar:", networkConfig.oldRegistrar);
  console.log("ENS Registry:", networkConfig.ens);
  console.log("Metadata Contract:", networkConfig.metadata);
  console.log("");
  console.log("🔧 CRITICAL NEXT STEPS:");
  console.log("");
  console.log("1. ⚠️ TRANSFER BASE NODE OWNERSHIP from old registrar to new:");
  console.log("   - You must own the old registrar");
  console.log("   - Call: oldRegistrar.transferBaseNodeOwnership(newRegistrarAddress)");
  console.log(`   - New address: ${registrarAddress}`);
  console.log("");
  console.log("2. 🔐 ADD CONTROLLER to new registrar:");
  console.log("   - Call: registrarV2.addController(controllerAddress)");
  console.log("");
  console.log("3. 📝 UPDATE CONTROLLER to use new registrar:");
  console.log("   - Update controller's registrar address");
  console.log("   - Use registerWithLabel() for new registrations");
  console.log("");
  console.log("4. 🏷️ MIGRATE EXISTING LABELS (optional):");
  console.log("   - Set labels for already-registered domains");
  console.log("   - Call: registrarV2.setLabel(tokenId, label)");
  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network,
    registrarV2: registrarAddress,
    oldRegistrar: networkConfig.oldRegistrar,
    ens: networkConfig.ens,
    baseNode: networkConfig.baseNode,
    metadata: networkConfig.metadata,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const filename = `deployments/registrar-v2-${network}.json`;
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", filename);
  console.log("");

  console.log("⚠️ WARNING: This is a new registrar contract.");
  console.log("You MUST transfer the base node ownership from the old registrar.");
  console.log("Until you do, the new registrar will not be able to register domains.");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
