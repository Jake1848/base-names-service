const hre = require("hardhat");

async function main() {
  console.log("\n🧪 Testing Controller registerWithLabel Call...\n");

  const [signer] = await hre.ethers.getSigners();
  const domain = "jake";
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(domain));
  const tokenId = BigInt(labelHash);
  const duration = 31536000; // 1 year

  const registrarV2Address = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";
  const controllerV2Address = "0x60f6BD54E360E24d975fE0DBF6923579636Af484";

  console.log("Testing direct registrar call first...\n");

  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(registrarV2Address);

  // Check if controller is authorized
  const controllerAuthorized = await v2.isController(controllerV2Address);
  console.log("Controller authorized:", controllerAuthorized);

  // Check if domain is available
  const available = await v2.available(tokenId);
  console.log("Domain available:", available);

  // Try to call registerWithLabel AS THE CONTROLLER (simulated)
  console.log("\n🔬 Testing if registerWithLabel exists and works...");

  try {
    // Check the function exists
    const iface = v2.interface;
    const fragment = iface.getFunction("registerWithLabel");
    console.log("✅ Function exists:", fragment.name);
    console.log("   Signature:", fragment.format("full"));
  } catch (e) {
    console.log("❌ Function doesn't exist:", e.message);
  }

  // Now test if we can call it (we're authorized)
  console.log("\n🧪 Attempting to call registerWithLabel...");

  try {
    const tx = await v2.registerWithLabel(
      tokenId,
      signer.address,
      duration,
      domain
    );
    console.log("✅ Transaction sent:", tx.hash);
    await tx.wait();
    console.log("✅ Transaction confirmed!");

    const owner = await v2.ownerOf(tokenId);
    console.log("✅ NFT minted to:", owner);

    const label = await v2.labels(tokenId);
    console.log("✅ Label stored:", label);

  } catch (error) {
    console.log("❌ Error calling registerWithLabel:");
    console.log("   ", error.message);

    if (error.data) {
      console.log("   Data:", error.data);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
