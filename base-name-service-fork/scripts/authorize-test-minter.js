const hre = require("hardhat");

async function main() {
  const testMinterAddress = process.env.TEST_MINTER_ADDRESS || process.argv[2];

  if (!testMinterAddress) {
    console.error("❌ Usage: TEST_MINTER_ADDRESS=0x... npx hardhat run scripts/authorize-test-minter.js --network base");
    console.error("   Or: node scripts/authorize-test-minter.js <test-minter-address>");
    process.exit(1);
  }

  console.log("🔐 Authorizing TestMinter as controller...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Operating as:", deployer.address);

  // Base Mainnet BaseRegistrar address
  const BASE_REGISTRAR = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca";

  const BaseRegistrar = await hre.ethers.getContractAt(
    "BaseRegistrarImplementation",
    BASE_REGISTRAR
  );

  // Check current owner
  const owner = await BaseRegistrar.owner();
  console.log("Registrar owner:", owner);
  console.log("Your address:", deployer.address);

  if (owner.toLowerCase() !== deployer.address.toLowerCase()) {
    console.error("❌ You are not the owner of the registrar!");
    console.error("   Current owner:", owner);
    process.exit(1);
  }

  console.log("\n📝 Adding TestMinter as controller...");
  console.log("TestMinter address:", testMinterAddress);

  const tx = await BaseRegistrar.addController(testMinterAddress);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Verify it was added
  const isController = await BaseRegistrar.isController(testMinterAddress);
  console.log("\n✅ TestMinter is now a controller:", isController);

  if (isController) {
    console.log("\n🎉 Success! You can now mint test domains for free:");
    console.log(`   node scripts/mint-test-domain.js mytest ${deployer.address}`);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
