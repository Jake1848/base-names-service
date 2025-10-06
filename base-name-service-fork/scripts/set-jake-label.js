const hre = require("hardhat");
const { ethers } = require("ethers");

async function main() {
  console.log("\n🏷️ Setting label for 'jake.base' domain...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  // Get metadata contract address from deployment
  const fs = require('fs');
  const deploymentFile = `deployments/metadata-${network}.json`;

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`Deployment file not found: ${deploymentFile}`);
  }

  const deployment = JSON.parse(fs.readFileSync(deploymentFile, 'utf8'));
  const metadataAddress = deployment.metadataContract;

  console.log("Metadata Contract:", metadataAddress);
  console.log("");

  // Calculate token ID for "jake"
  const label = "jake";
  const labelHash = ethers.keccak256(ethers.toUtf8Bytes(label));
  const tokenId = BigInt(labelHash);

  console.log("Label:", label);
  console.log("Label Hash:", labelHash);
  console.log("Token ID:", tokenId.toString());
  console.log("");

  // Get contract
  const BaseNamesMetadata = await hre.ethers.getContractFactory("BaseNamesMetadataWithStorage");
  const metadata = BaseNamesMetadata.attach(metadataAddress);

  // Set label
  console.log("📝 Setting label...");
  const tx = await metadata.setLabel(tokenId, label);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Label set successfully!");
  console.log("");

  // Verify it was set
  const storedLabel = await metadata.getLabel(tokenId);
  console.log("Stored label:", storedLabel);
  console.log("");

  // Get the full tokenURI
  console.log("🎨 Generating metadata...");
  try {
    const uri = await metadata.tokenURI(tokenId);

    // Decode and display the metadata
    if (uri.startsWith('data:application/json;base64,')) {
      const base64Data = uri.split(',')[1];
      const jsonData = Buffer.from(base64Data, 'base64').toString('utf8');
      const metadata = JSON.parse(jsonData);

      console.log("✅ Metadata generated successfully!");
      console.log("");
      console.log("Name:", metadata.name);
      console.log("Description:", metadata.description.substring(0, 100) + "...");
      console.log("External URL:", metadata.external_url);
      console.log("");
      console.log("Attributes:");
      metadata.attributes.forEach(attr => {
        console.log(`  - ${attr.trait_type}: ${attr.value}`);
      });
      console.log("");
      console.log("Image:", metadata.image.substring(0, 50) + "...");
    }
  } catch (error) {
    console.log("❌ Error generating metadata:", error.message);
  }

  console.log("");
  console.log("═══════════════════════════════════════════════════════");
  console.log("✅ COMPLETE!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("The 'jake.base' domain now has proper metadata!");
  console.log("It will display beautifully in MetaMask, OpenSea, etc.");
  console.log("");
  console.log("⚠️ IMPORTANT: To make this work in wallets, the BaseRegistrar");
  console.log("contract needs to be updated to call metadataContract.tokenURI()");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
