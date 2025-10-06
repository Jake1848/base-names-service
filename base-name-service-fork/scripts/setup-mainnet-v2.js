const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Setting up mainnet V2 infrastructure...\n");

  const newRegistrar = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca";
  const metadata = "0xc30A22d048E1F9fe878b779D26c328eBAa7Bb797";

  // 1. Update metadata
  console.log("1️⃣ Authorizing new registrar on metadata...");
  const Metadata = await hre.ethers.getContractFactory("BaseNamesMetadataWithStorage");
  const metadataContract = Metadata.attach(metadata);

  const isAuthorized = await metadataContract.authorizedCallers(newRegistrar);
  if (!isAuthorized) {
    const tx1 = await metadataContract.setAuthorizedCaller(newRegistrar, true);
    await tx1.wait();
    console.log("✅ Authorized! Hash:", tx1.hash);
  } else {
    console.log("✅ Already authorized!");
  }

  // 2. Set metadata on registrar
  console.log("\n2️⃣ Setting metadata on registrar...");
  const Registrar = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrar = Registrar.attach(newRegistrar);

  const currentMetadata = await registrar.metadataContract();
  if (currentMetadata.toLowerCase() !== metadata.toLowerCase()) {
    const tx2 = await registrar.setMetadataContract(metadata);
    await tx2.wait();
    console.log("✅ Set! Hash:", tx2.hash);
  } else {
    console.log("✅ Already set!");
  }

  console.log("\n✅ Mainnet V2 setup complete!");
  console.log("New Registrar:", newRegistrar);
  console.log("Metadata:", metadata);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
