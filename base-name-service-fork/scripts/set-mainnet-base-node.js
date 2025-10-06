const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Setting .base node owner on mainnet...\n");

  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
  const baseNode = hre.ethers.namehash("base");
  const newRegistrar = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";

  console.log("ENS Registry:", ensRegistry);
  console.log("Base Node:", baseNode);
  console.log("New Registrar:", newRegistrar);
  console.log("");

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)",
     "function setOwner(bytes32 node, address owner) external"],
    ensRegistry
  );

  // Check current owner
  const currentOwner = await ENS.owner(baseNode);
  console.log("Current .base owner:", currentOwner);
  console.log("");

  if (currentOwner.toLowerCase() === newRegistrar.toLowerCase()) {
    console.log("✅ Already set to new registrar!");
    return;
  }

  // Set new owner
  console.log("📝 Setting .base node owner to new registrar...");
  const tx = await ENS.setOwner(baseNode, newRegistrar);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Ownership transferred!");
  console.log("");

  // Verify
  const newOwner = await ENS.owner(baseNode);
  console.log("New .base owner:", newOwner);
  console.log("Success:", newOwner.toLowerCase() === newRegistrar.toLowerCase() ? "✅ YES" : "❌ NO");
  console.log("");
  console.log("🎉 Mainnet setup complete!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
