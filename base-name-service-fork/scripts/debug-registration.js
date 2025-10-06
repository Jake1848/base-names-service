const hre = require("hardhat");

async function main() {
  console.log("\n🔍 Debugging Registration Issue...\n");

  const domain = "jake";
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(domain));
  const tokenId = BigInt(labelHash);

  const registrarV2Address = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";
  const controllerV2Address = "0x60f6BD54E360E24d975fE0DBF6923579636Af484";

  console.log("Domain:", domain);
  console.log("Label Hash:", labelHash);
  console.log("Token ID:", tokenId.toString());
  console.log("");

  // Check registrar
  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(registrarV2Address);

  console.log("📋 Checking Registrar V2...");

  try {
    const available = await v2.available(tokenId);
    console.log("✅ Available:", available);
  } catch (e) {
    console.log("❌ Error checking available:", e.message);
  }

  try {
    const expires = await v2.nameExpires(tokenId);
    console.log("✅ Expires:", expires.toString(), "(", new Date(Number(expires) * 1000).toISOString(), ")");
  } catch (e) {
    console.log("❌ Error checking expires:", e.message);
  }

  try {
    const owner = await v2.ownerOf(tokenId);
    console.log("✅ Owner:", owner);
  } catch (e) {
    console.log("✅ No owner (not yet minted)");
  }

  console.log("");
  console.log("🎮 Checking Controller V2...");

  const Controller = await hre.ethers.getContractFactory("ETHRegistrarControllerV2");
  const controller = Controller.attach(controllerV2Address);

  try {
    const isController = await v2.isController(controllerV2Address);
    console.log("✅ Controller authorized:", isController);
  } catch (e) {
    console.log("❌ Error checking controller:", e.message);
  }

  try {
    const valid = await controller.valid(domain);
    console.log("✅ Name valid:", valid);
  } catch (e) {
    console.log("❌ Error checking valid:", e.message);
  }

  try {
    const minCommitmentAge = await controller.minCommitmentAge();
    const maxCommitmentAge = await controller.maxCommitmentAge();
    console.log("✅ Commitment age:", minCommitmentAge.toString(), "-", maxCommitmentAge.toString());
  } catch (e) {
    console.log("❌ Error checking commitment age:", e.message);
  }

  // Check if ControllerV2 has the right base address
  try {
    const baseAddress = await controller.base();
    console.log("✅ Controller's base registrar:", baseAddress);
    console.log("   Expected:", registrarV2Address);
    console.log("   Match:", baseAddress.toLowerCase() === registrarV2Address.toLowerCase() ? "✅" : "❌");
  } catch (e) {
    console.log("❌ Error checking base:", e.message);
  }

  console.log("");
  console.log("🔬 Testing registerWithLabel function...");

  try {
    // Simulate calling registerWithLabel
    const [signer] = await hre.ethers.getSigners();
    const isAuthorized = await v2.isController(signer.address);
    console.log("Your address authorized as controller:", isAuthorized);

    if (isAuthorized) {
      console.log("\n💡 You can register directly via registrar!");
      console.log("   await v2.registerWithLabel(tokenId, owner, duration, label)");
    }
  } catch (e) {
    console.log("❌ Error:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
