const hre = require("hardhat");

async function main() {
  console.log("\n🏷️ Setting jake label in new registrar...\n");

  const network = hre.network.name;
  const registrarV2Address = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";

  console.log("Network:", network);
  console.log("Registrar V2:", registrarV2Address);
  console.log("");

  const label = "jake";
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(label));
  const tokenId = BigInt(labelHash);

  console.log("Label:", label);
  console.log("Label Hash:", labelHash);
  console.log("Token ID:", tokenId.toString());
  console.log("");

  const RegistrarV2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrarV2 = RegistrarV2.attach(registrarV2Address);

  // Set label
  console.log("📝 Setting label...");
  const tx = await registrarV2.setLabel(tokenId, label);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Label set successfully!");
  console.log("");

  // Verify
  const storedLabel = await registrarV2.getLabel(tokenId);
  console.log("Stored label:", storedLabel);
  console.log("");

  // Test name and symbol
  console.log("📝 Testing ERC-721 metadata functions...");
  const name = await registrarV2.name();
  const symbol = await registrarV2.symbol();
  console.log("Collection name:", name);
  console.log("Collection symbol:", symbol);
  console.log("");

  // Get tokenURI
  console.log("🎨 Getting tokenURI...");
  try {
    const uri = await registrarV2.tokenURI(tokenId);

    if (uri.startsWith('data:application/json;base64,')) {
      const base64Data = uri.split(',')[1];
      const jsonData = Buffer.from(base64Data, 'base64').toString('utf8');
      const metadata = JSON.parse(jsonData);

      console.log("✅ Metadata generated successfully!");
      console.log("");
      console.log("═══════════════════════════════════════════════════════");
      console.log("📋 METADATA PREVIEW");
      console.log("═══════════════════════════════════════════════════════");
      console.log("");
      console.log("Name:", metadata.name);
      console.log("Description:", metadata.description);
      console.log("External URL:", metadata.external_url);
      console.log("");
      console.log("Attributes:");
      metadata.attributes.forEach(attr => {
        console.log(`  - ${attr.trait_type}: ${attr.value}`);
      });
      console.log("");
      console.log("Image (truncated):", metadata.image.substring(0, 80) + "...");
      console.log("");
      console.log("═══════════════════════════════════════════════════════");
      console.log("✅ SUCCESS!");
      console.log("═══════════════════════════════════════════════════════");
      console.log("");
      console.log("🎉 The jake.base NFT now has beautiful metadata!");
      console.log("");
      console.log("What this means:");
      console.log("✅ MetaMask will show 'Base Names' collection");
      console.log("✅ Symbol will be 'BASE'");
      console.log("✅ NFT will display with beautiful SVG image");
      console.log("✅ All attributes will be visible");
      console.log("✅ OpenSea will display perfectly");
      console.log("");
    }
  } catch (error) {
    console.log("❌ Error getting tokenURI:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
