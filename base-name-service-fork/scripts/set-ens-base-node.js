const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Setting ENS .base node owner...\n");

  const network = hre.network.name;
  console.log("Network:", network);

  const ensRegistry = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";
  const baseNode = hre.ethers.namehash("base"); // Correct namehash calculation
  const newRegistrar = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";

  console.log("ENS Registry:", ensRegistry);
  console.log("Base Node:", baseNode);
  console.log("New Registrar:", newRegistrar);
  console.log("");

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)",
     "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external returns (bytes32)"],
    ensRegistry
  );

  // Check current owner
  const currentOwner = await ENS.owner(baseNode);
  console.log("Current .base node owner:", currentOwner);
  console.log("");

  if (currentOwner.toLowerCase() === newRegistrar.toLowerCase()) {
    console.log("✅ Base node already owned by new registrar!");
    return;
  }

  // Create .base node by setting subnode under root
  // root node = 0x0000...
  // label = keccak256("base")
  const rootNode = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const baseLabel = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("base"));

  console.log("📝 Creating/Setting .base node owner...");
  console.log("Root node:", rootNode);
  console.log("Base label:", baseLabel);
  console.log("");

  const tx = await ENS.setSubnodeOwner(rootNode, baseLabel, newRegistrar);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Base node created and owner set!");
  console.log("");

  // Verify
  const newOwner = await ENS.owner(baseNode);
  console.log("New .base node owner:", newOwner);
  console.log("Success:", newOwner.toLowerCase() === newRegistrar.toLowerCase() ? "✅ YES" : "❌ NO");
  console.log("");

  console.log("═══════════════════════════════════════════════════════");
  console.log("🎉 ENS Configuration Complete!");
  console.log("═══════════════════════════════════════════════════════");
  console.log("");
  console.log("The new registrar now controls the .base TLD in ENS!");
  console.log("It can now:");
  console.log("- Register domains");
  console.log("- Set subdomain owners");
  console.log("- Manage ENS records");
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
