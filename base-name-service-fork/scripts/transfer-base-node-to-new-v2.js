const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Transferring .base node to new V2 registrar...\n");

  const oldV2Registrar = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9"; // Wrong baseNode
  const newV2Registrar = "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6"; // Correct baseNode
  const ensRegistry = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";

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

  if (currentOwner.toLowerCase() === oldV2Registrar.toLowerCase()) {
    console.log("📝 Transferring via old registrar...");

    const OldV2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
    const oldV2 = OldV2.attach(oldV2Registrar);

    try {
      const tx = await oldV2.transferBaseNodeOwnership(newV2Registrar);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Transfer successful!");
    } catch (e) {
      console.log("❌ Transfer via registrar failed:", e.message);
      console.log("\n💡 Trying direct ENS transfer...");

      const [signer] = await hre.ethers.getSigners();
      const rootOwner = await ENS.owner(rootNode);
      console.log("Root owner:", rootOwner);
      console.log("Your address:", signer.address);

      if (rootOwner.toLowerCase() === signer.address.toLowerCase()) {
        console.log("✅ You own the root! Transferring directly...");
        const tx = await ENS.setSubnodeOwner(rootNode, baseLabel, newV2Registrar);
        console.log("Transaction hash:", tx.hash);
        await tx.wait();
        console.log("✅ Transfer successful!");
      } else {
        console.log("❌ You don't own the root node.");
      }
    }
  } else {
    console.log("⚠️ Old V2 doesn't own .base node!");
    console.log("Attempting direct transfer...");

    const [signer] = await hre.ethers.getSigners();
    const rootOwner = await ENS.owner(rootNode);

    if (rootOwner.toLowerCase() === signer.address.toLowerCase()) {
      console.log("✅ You own the root! Transferring...");
      const tx = await ENS.setSubnodeOwner(rootNode, baseLabel, newV2Registrar);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Transfer successful!");
    }
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
