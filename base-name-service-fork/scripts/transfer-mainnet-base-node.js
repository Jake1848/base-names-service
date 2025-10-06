const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Transferring .base node to new V2 registrar on MAINNET...\n");

  const oldV2Registrar = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00"; // Wrong baseNode
  const newV2Registrar = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca"; // Correct baseNode
  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";

  console.log("Old V2 Registrar:", oldV2Registrar);
  console.log("New V2 Registrar:", newV2Registrar);
  console.log("ENS Registry:", ensRegistry);
  console.log("");

  const baseNode = hre.ethers.namehash("base");
  const baseLabel = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("base"));
  const rootNode = hre.ethers.ZeroHash;

  console.log("Base node:", baseNode);
  console.log("Base label:", baseLabel);
  console.log("");

  // Check current owner
  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) view returns (address)",
     "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external returns (bytes32)"],
    ensRegistry
  );

  const currentOwner = await ENS.owner(baseNode);
  console.log("Current .base node owner:", currentOwner);
  console.log("Expected (old V2):", oldV2Registrar);
  console.log("");

  const [signer] = await hre.ethers.getSigners();
  const rootOwner = await ENS.owner(rootNode);
  console.log("Root owner:", rootOwner);
  console.log("Your address:", signer.address);
  console.log("");

  if (rootOwner.toLowerCase() === signer.address.toLowerCase()) {
    console.log("✅ You own the root! Transferring...");
    const tx = await ENS.setSubnodeOwner(rootNode, baseLabel, newV2Registrar);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Transfer successful!");
  } else {
    console.log("❌ You don't own the root node. Cannot transfer.");
  }

  // Verify
  const newOwner = await ENS.owner(baseNode);
  console.log("\n📋 Final verification:");
  console.log("New .base node owner:", newOwner);
  console.log("Expected:", newV2Registrar);
  console.log("Match:", newOwner.toLowerCase() === newV2Registrar.toLowerCase() ? "✅" : "❌");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
