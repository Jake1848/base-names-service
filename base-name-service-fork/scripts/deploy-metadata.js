const hre = require("hardhat");

async function main() {
  console.log("\n🚀 Deploying BaseNamesMetadataWithStorage...\n");

  // Get network
  const network = hre.network.name;
  console.log("Network:", network);

  // Get registrar address based on network
  const registrarAddresses = {
    "base-sepolia": "0x69b81319958388b5133DF617Ba542FB6c9e03177",
    baseSepolia: "0x69b81319958388b5133DF617Ba542FB6c9e03177",
    base: "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917"
  };

  const registrarAddress = registrarAddresses[network];
  if (!registrarAddress) {
    throw new Error(`No registrar address configured for network: ${network}`);
  }

  console.log("BaseRegistrar:", registrarAddress);
  console.log("");

  // Deploy metadata contract
  const BaseNamesMetadata = await hre.ethers.getContractFactory("BaseNamesMetadataWithStorage");
  const metadata = await BaseNamesMetadata.deploy(registrarAddress);

  await metadata.waitForDeployment();
  const metadataAddress = await metadata.getAddress();

  console.log("✅ BaseNamesMetadataWithStorage deployed to:", metadataAddress);
  console.log("");

  // Wait for a few block confirmations
  console.log("⏳ Waiting for block confirmations...");
  await metadata.deploymentTransaction().wait(5);
  console.log("✅ Confirmed!");
  console.log("");

  // Get controller address
  const controllerAddresses = {
    "base-sepolia": "0xCD24477aFCB5D97B3B794a376d6a1De38e640564",
    baseSepolia: "0xCD24477aFCB5D97B3B794a376d6a1De38e640564",
    base: "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e"
  };

  const controllerAddress = controllerAddresses[network];

  // Authorize the controller to set labels
  console.log("🔧 Authorizing controller to set labels...");
  console.log("Controller:", controllerAddress);
  const tx = await metadata.setAuthorizedCaller(controllerAddress, true);
  await tx.wait();
  console.log("✅ Controller authorized!");
  console.log("");

  // Verify on BaseScan
  if (network !== "hardhat" && network !== "localhost") {
    console.log("📝 Verifying contract on BaseScan...");
    console.log("⏳ Waiting 30 seconds before verification...");
    await new Promise(resolve => setTimeout(resolve, 30000));

    try {
      await hre.run("verify:verify", {
        address: metadataAddress,
        constructorArguments: [registrarAddress],
      });
      console.log("✅ Contract verified!");
    } catch (error) {
      console.log("⚠️ Verification failed:", error.message);
      console.log("You can verify manually later with:");
      console.log(`npx hardhat verify --network ${network} ${metadataAddress} ${registrarAddress}`);
    }
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("📋 DEPLOYMENT SUMMARY");
  console.log("═══════════════════════════════════════════════════════");
  console.log("Network:", network);
  console.log("Metadata Contract:", metadataAddress);
  console.log("BaseRegistrar:", registrarAddress);
  console.log("Controller:", controllerAddress);
  console.log("");
  console.log("🔧 NEXT STEPS:");
  console.log("1. Set label for existing domain 'jake':");
  console.log(`   await metadata.setLabel(labelHash('jake'), 'jake')`);
  console.log("");
  console.log("2. For future registrations, update the controller to call:");
  console.log(`   metadata.setLabel(tokenId, name)`);
  console.log("");
  console.log("3. Update BaseRegistrar to return metadata:");
  console.log(`   Add: function tokenURI(uint256 tokenId) returns (string)`);
  console.log(`   Call: metadataContract.tokenURI(tokenId)`);
  console.log("═══════════════════════════════════════════════════════");
  console.log("");

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    network,
    metadataContract: metadataAddress,
    registrar: registrarAddress,
    controller: controllerAddress,
    deployedAt: new Date().toISOString(),
    blockNumber: await hre.ethers.provider.getBlockNumber()
  };

  const filename = `deployments/metadata-${network}.json`;
  fs.mkdirSync('deployments', { recursive: true });
  fs.writeFileSync(filename, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", filename);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
