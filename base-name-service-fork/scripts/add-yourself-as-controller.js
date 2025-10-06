const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Adding your address as controller to V2...\n");

  const [signer] = await hre.ethers.getSigners();
  const registrarV2 = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";

  console.log("Your address:", signer.address);
  console.log("Registrar V2:", registrarV2);
  console.log("");

  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(registrarV2);

  console.log("📝 Adding you as controller...");
  const tx = await v2.addController(signer.address);
  console.log("Transaction hash:", tx.hash);
  
  await tx.wait();
  console.log("✅ You are now a controller!");
  console.log("");
  
  // Verify
  const isController = await v2.isController(signer.address);
  console.log("Verified:", isController ? "✅ YES" : "❌ NO");
  console.log("");
  console.log("Now you can register domains directly via the registrar!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
