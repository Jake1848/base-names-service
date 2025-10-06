const hre = require("hardhat");

async function main() {
  console.log("\n🔄 Transferring .base node ownership on mainnet...\n");

  const oldRegistrar = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";
  const newRegistrar = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";

  console.log("Old Registrar:", oldRegistrar);
  console.log("New Registrar:", newRegistrar);
  console.log("");

  const OldReg = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldReg = OldReg.attach(oldRegistrar);

  console.log("📝 Transferring base node ownership...");
  const tx = await oldReg.transferBaseNodeOwnership(newRegistrar);
  console.log("Transaction hash:", tx.hash);

  await tx.wait();
  console.log("✅ Ownership transferred!");
  console.log("");

  // Verify
  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
  const baseNode = hre.ethers.namehash("base");

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)"],
    ensRegistry
  );

  const newOwner = await ENS.owner(baseNode);
  console.log("New .base node owner:", newOwner);
  console.log("Success:", newOwner.toLowerCase() === newRegistrar.toLowerCase() ? "✅ YES" : "❌ NO");
  console.log("");
  console.log("🎉 The new registrar now controls .base on mainnet!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
