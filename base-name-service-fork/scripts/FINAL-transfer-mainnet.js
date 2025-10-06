const hre = require("hardhat");

async function main() {
  console.log("\n🚀 TRANSFERRING BASE NODE OWNERSHIP TO V2...\n");
  console.log("⚠️  THIS IS A PRODUCTION OPERATION ⚠️\n");

  const oldRegistrar = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";
  const newRegistrar = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";

  console.log("Old Registrar (V1):", oldRegistrar);
  console.log("New Registrar (V2):", newRegistrar);
  console.log("");

  const OldReg = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldReg = OldReg.attach(oldRegistrar);

  console.log("📝 Calling transferBaseNodeOwnership...");
  console.log("");

  try {
    const tx = await oldReg.transferBaseNodeOwnership(newRegistrar, {
      gasLimit: 200000
    });
    
    console.log("✅ Transaction submitted!");
    console.log("Transaction hash:", tx.hash);
    console.log("");
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed!");
    console.log("Block:", receipt.blockNumber);
    console.log("Gas used:", receipt.gasUsed.toString());
    console.log("");

    // Verify
    const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
    const baseNode = hre.ethers.namehash("base");

    const ENS = await hre.ethers.getContractAt(
      ["function owner(bytes32 node) external view returns (address)"],
      ensRegistry
    );

    const newOwner = await ENS.owner(baseNode);
    console.log("═══════════════════════════════════════════════════════");
    console.log("✅ VERIFICATION");
    console.log("═══════════════════════════════════════════════════════");
    console.log("");
    console.log("ENS .base node owner:", newOwner);
    console.log("Expected (V2):", newRegistrar);
    console.log("");
    
    if (newOwner.toLowerCase() === newRegistrar.toLowerCase()) {
      console.log("🎉 SUCCESS! V2 NOW CONTROLS .BASE ON MAINNET!");
      console.log("");
      console.log("What this means:");
      console.log("✅ V2 can now register domains");
      console.log("✅ New domains get beautiful metadata automatically");
      console.log("✅ NFTs display as 'Base Names' collection");
      console.log("");
      console.log("Next steps:");
      console.log("1. Update frontend to use V2: 0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00");
      console.log("2. Test a registration");
      console.log("3. Verify metadata displays in MetaMask");
    } else {
      console.log("❌ TRANSFER FAILED - Owner not updated");
    }

  } catch (error) {
    console.log("❌ ERROR:", error.message);
    console.log("");
    console.log("This might be because:");
    console.log("- Gas limit too low");
    console.log("- ENS registry restrictions");
    console.log("- Network issues");
    console.log("");
    console.log("Full error:");
    console.log(error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
