const hre = require("hardhat");

async function main() {
  const oldRegistrar = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";
  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
  const baseNode = hre.ethers.namehash("base");

  console.log("Checking if old registrar is 'live'...\n");

  const OldReg = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldReg = OldReg.attach(oldRegistrar);

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)"],
    ensRegistry
  );

  // Get baseNode from contract
  const contractBaseNode = await oldReg.baseNode();
  console.log("Contract baseNode:", contractBaseNode);
  console.log("Calculated baseNode:", baseNode);
  console.log("Match:", contractBaseNode === baseNode);
  console.log("");

  // Check who owns the base node in ENS
  const baseNodeOwner = await ENS.owner(contractBaseNode);
  console.log("ENS baseNode owner:", baseNodeOwner);
  console.log("Old registrar address:", oldRegistrar);
  console.log("Old registrar controls it:", baseNodeOwner.toLowerCase() === oldRegistrar.toLowerCase());
  console.log("");

  if (baseNodeOwner.toLowerCase() !== oldRegistrar.toLowerCase()) {
    console.log("❌ Old registrar is NOT 'live'");
    console.log("The 'live' modifier will cause transferBaseNodeOwnership to revert.");
    console.log("");
    console.log("This means the old registrar lost control of the baseNode.");
    console.log("You'll need to use ENS registry directly or find another way.");
  } else {
    console.log("✅ Old registrar is 'live' and can transfer ownership");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
