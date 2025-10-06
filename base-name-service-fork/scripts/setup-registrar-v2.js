const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Setting up BaseRegistrarImplementationV2...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  // Load deployment info
  const fs = require('fs');
  const deploymentFile = `deployments/registrar-v2-${network}.json`;

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));

  const registrarV2Address = deployment.registrarV2;
  const oldRegistrarAddress = deployment.oldRegistrar;

  console.log("New Registrar V2:", registrarV2Address);
  console.log("Old Registrar:", oldRegistrarAddress);
  console.log("");

  // Controller addresses
  const controllerAddresses = {
    "base-sepolia": "0xCD24477aFCB5D97B3B794a376d6a1De38e640564",
    baseSepolia: "0xCD24477aFCB5D97B3B794a376d6a1De38e640564",
    base: "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e"
  };

  const controllerAddress = controllerAddresses[network];
  console.log("Controller:", controllerAddress);
  console.log("");

  // Get contracts
  const RegistrarV2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrarV2 = RegistrarV2.attach(registrarV2Address);

  const OldRegistrar = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldRegistrar = OldRegistrar.attach(oldRegistrarAddress);

  // Step 1: Add controller to new registrar
  console.log("📝 Step 1: Adding controller to new registrar...");
  try {
    const tx1 = await registrarV2.addController(controllerAddress);
    console.log("Transaction hash:", tx1.hash);
    await tx1.wait();
    console.log("✅ Controller added to new registrar!");
  } catch (error) {
    console.log("⚠️ Error adding controller:", error.message);
  }
  console.log("");

  // Step 2: Transfer base node ownership from old to new registrar
  console.log("📝 Step 2: Transferring base node ownership...");
  console.log("⚠️ This transfers control from old registrar to new registrar");
  console.log("");

  try {
    const tx2 = await oldRegistrar.transferBaseNodeOwnership(registrarV2Address);
    console.log("Transaction hash:", tx2.hash);
    await tx2.wait();
    console.log("✅ Base node ownership transferred!");
    console.log("");
    console.log("🎉 The new registrar now controls the .base TLD!");
  } catch (error) {
    console.log("❌ Error transferring ownership:", error.message);
    console.log("");
    console.log("This might fail if:");
    console.log("- You don't own the old registrar");
    console.log("- The old registrar doesn't have transferBaseNodeOwnership function");
    console.log("- The ENS Registry ownership is not with old registrar");
  }
  console.log("");

  // Step 3: Migrate jake.base label
  console.log("📝 Step 3: Migrating 'jake.base' label to new registrar...");
  const label = "jake";
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(label));
  const tokenId = BigInt(labelHash);

  try {
    const tx3 = await registrarV2.setLabel(tokenId, label);
    console.log("Transaction hash:", tx3.hash);
    await tx3.wait();
    console.log("✅ Label migrated to new registrar!");
  } catch (error) {
    console.log("⚠️ Error setting label:", error.message);
  }
  console.log("");

  // Verify setup
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ SETUP COMPLETE!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("📊 Status:");

  try {
    const isController = await registrarV2.isController(controllerAddress);
    console.log("- Controller authorized:", isController ? "✅ YES" : "❌ NO");
  } catch (e) {
    console.log("- Controller authorized: ❌ Could not verify");
  }

  try {
    const storedLabel = await registrarV2.getLabel(tokenId);
    console.log("- Jake label migrated:", storedLabel === label ? "✅ YES" : "❌ NO");
  } catch (e) {
    console.log("- Jake label migrated: ❌ Could not verify");
  }

  console.log("");
  console.log("🎯 Next Steps:");
  console.log("1. Test metadata display by checking tokenURI");
  console.log("2. Update frontend to use new registrar address");
  console.log("3. Register a test domain to verify everything works");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
