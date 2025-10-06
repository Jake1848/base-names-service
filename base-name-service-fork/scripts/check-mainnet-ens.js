const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const ensRegistry = "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E";
  const rootNode = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const baseNode = hre.ethers.namehash("base");

  console.log("Your address:", signer.address);
  console.log("");

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)"],
    ensRegistry
  );

  const rootOwner = await ENS.owner(rootNode);
  console.log("ENS Root owner:", rootOwner);
  console.log("You own root:", rootOwner.toLowerCase() === signer.address.toLowerCase());
  console.log("");

  const baseNodeOwner = await ENS.owner(baseNode);
  console.log("ENS .base node owner:", baseNodeOwner);
  console.log("");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
