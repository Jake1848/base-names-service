const hre = require("hardhat");

async function main() {
  console.log("\n🧪 Testing DIRECT registerWithLabel call...\n");

  const [signer] = await hre.ethers.getSigners();
  const domain = "testdomain123";
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(domain));
  const tokenId = BigInt(labelHash);
  const duration = 31536000;

  const registrarAddress = "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6";
  console.log("Registrar:", registrarAddress);
  console.log("Domain:", domain);
  console.log("Token ID:", tokenId.toString());
  console.log("Signer:", signer.address);
  console.log("");

  const Registrar = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrar = Registrar.attach(registrarAddress);

  // Check if we're a controller
  const isController = await registrar.isController(signer.address);
  console.log("Are we a controller?", isController);

  if (!isController) {
    console.log("❌ Not a controller! Adding ourselves...");
    const tx = await registrar.addController(signer.address);
    await tx.wait();
    console.log("✅ Added!");
  }

  // Check availability
  const available = await registrar.available(tokenId);
  console.log("Domain available:", available);
  console.log("");

  // Try to register
  console.log("🧪 Calling registerWithLabel...");
  try {
    const tx = await registrar.registerWithLabel(
      tokenId,
      signer.address,
      duration,
      domain
    );
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ SUCCESS!");

    const owner = await registrar.ownerOf(tokenId);
    console.log("Owner:", owner);

    const label = await registrar.labels(tokenId);
    console.log("Label:", label);
  } catch (error) {
    console.log("❌ FAILED!");
    console.log("Error:", error.message);
    if (error.data) {
      console.log("Data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
