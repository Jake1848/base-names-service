const hre = require("hardhat");

async function main() {
  const oldRegistrar = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";
  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";

  console.log("Debugging baseNode mismatch...\n");

  const OldReg = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldReg = OldReg.attach(oldRegistrar);

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)"],
    ensRegistry
  );

  // Get baseNode from contract
  const contractBaseNode = await oldReg.baseNode();
  const calculatedBaseNode = hre.ethers.namehash("base");

  console.log("Contract's baseNode:", contractBaseNode);
  console.log("Calculated namehash('base'):", calculatedBaseNode);
  console.log("Match:", contractBaseNode === calculatedBaseNode);
  console.log("");

  // Check who owns the contract's baseNode
  const owner = await ENS.owner(contractBaseNode);
  console.log("Owner of contract's baseNode:", owner);
  console.log("Old registrar address:", oldRegistrar);
  console.log("Is live (owns its baseNode):", owner.toLowerCase() === oldRegistrar.toLowerCase());
  console.log("");

  // Check ENS registry
  const ensAddress = await oldReg.ens();
  console.log("Contract's ENS registry:", ensAddress);
  console.log("Expected ENS registry:", ensRegistry);
  console.log("Match:", ensAddress.toLowerCase() === ensRegistry.toLowerCase());
  console.log("");

  if (owner.toLowerCase() !== oldRegistrar.toLowerCase()) {
    console.log("❌ PROBLEM: Old registrar is NOT 'live'");
    console.log("The baseNode is owned by:", owner);
    console.log("This will cause transferBaseNodeOwnership to revert.");
    console.log("");
    console.log("The 'live' modifier requires: ens.owner(baseNode) == address(this)");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
