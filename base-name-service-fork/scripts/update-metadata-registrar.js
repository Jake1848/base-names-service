const hre = require("hardhat");

async function main() {
  console.log("\n🔧 Updating metadata contract with new registrar...\n");

  const metadataAddress = "0xDb770A373c99DAcE31B8f0e456e9D97CbAed057b";
  const newRegistrarAddress = "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6";

  console.log("Metadata contract:", metadataAddress);
  console.log("New registrar:", newRegistrarAddress);
  console.log("");

  const Metadata = await hre.ethers.getContractFactory("BaseNamesMetadataWithStorage");
  const metadata = Metadata.attach(metadataAddress);

  // Check current registrar
  const currentRegistrar = await metadata.registrar();
  console.log("Current registrar:", currentRegistrar);
  console.log("New registrar:", newRegistrarAddress);
  console.log("");

  if (currentRegistrar.toLowerCase() === newRegistrarAddress.toLowerCase()) {
    console.log("✅ Already set to new registrar!");
  } else {
    console.log("📝 Metadata contract registrar is immutable - cannot change");
    console.log("   This is OK - we'll authorize the metadata contract on the new registrar instead");
  }

  // Authorize metadata contract as caller on new registrar
  console.log("\n🔐 Authorizing metadata contract on new registrar...");

  const Registrar = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const registrar = Registrar.attach(newRegistrarAddress);

  // Check if metadata needs authorization
  const isAuthorized = await metadata.authorizedCallers(newRegistrarAddress);
  console.log("Metadata has new registrar authorized:", isAuthorized);

  if (!isAuthorized) {
    console.log("📝 Authorizing new registrar on metadata...");
    const tx = await metadata.setAuthorizedCaller(newRegistrarAddress, true);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Authorized!");
  } else {
    console.log("✅ Already authorized!");
  }

  // Also need to set metadata contract on new registrar
  console.log("\n🔐 Setting metadata contract on new registrar...");
  const currentMetadata = await registrar.metadataContract();
  console.log("Current metadata on registrar:", currentMetadata);

  if (currentMetadata.toLowerCase() === metadataAddress.toLowerCase()) {
    console.log("✅ Already set!");
  } else {
    const tx = await registrar.setMetadataContract(metadataAddress);
    console.log("Transaction hash:", tx.hash);
    await tx.wait();
    console.log("✅ Set!");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
