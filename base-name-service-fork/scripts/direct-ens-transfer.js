const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Attempting direct ENS transfer (as root owner)...\n");

  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
  const baseNode = hre.ethers.namehash("base");
  const oldRegistrar = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";
  const newRegistrar = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)",
     "function setOwner(bytes32 node, address owner) external",
     "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external returns (bytes32)"],
    ensRegistry
  );

  // Check current state
  const currentOwner = await ENS.owner(baseNode);
  const rootOwner = await ENS.owner("0x0000000000000000000000000000000000000000000000000000000000000000");

  console.log("Root owner:", rootOwner);
  console.log("Current .base owner:", currentOwner);
  console.log("Target (V2):", newRegistrar);
  console.log("");

  // Since .base is currently owned by oldRegistrar (not root),
  // and you own root, we need to use setSubnodeOwner from root
  console.log("Strategy: Use setSubnodeOwner from root to reassign .base");
  console.log("");

  const baseLabel = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("base"));
  const rootNode = "0x0000000000000000000000000000000000000000000000000000000000000000";

  console.log("📝 Calling setSubnodeOwner...");
  const tx = await ENS.setSubnodeOwner(rootNode, baseLabel, newRegistrar, {
    gasLimit: 200000
  });

  console.log("Transaction hash:", tx.hash);
  console.log("⏳ Waiting...");

  await tx.wait();
  console.log("✅ Transaction confirmed!");
  console.log("");

  // Verify
  const newOwner = await ENS.owner(baseNode);
  console.log("New .base owner:", newOwner);
  console.log("Success:", newOwner.toLowerCase() === newRegistrar.toLowerCase() ? "✅ YES" : "❌ NO");

  if (newOwner.toLowerCase() === newRegistrar.toLowerCase()) {
    console.log("");
    console.log("🎉 V2 NOW CONTROLS .BASE ON MAINNET!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
