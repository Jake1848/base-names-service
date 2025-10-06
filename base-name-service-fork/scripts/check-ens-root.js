const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Your address:", signer.address);
  console.log("");

  const ensRegistry = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";
  const rootNode = "0x0000000000000000000000000000000000000000000000000000000000000000";
  const baseNode = "0x0902329b42866a8e566c30c58f4c3e1b42c05c82b5e42619c478968c7c1f2a79";

  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)"],
    ensRegistry
  );

  const rootOwner = await ENS.owner(rootNode);
  console.log("ENS Root (.) owner:", rootOwner);
  console.log("You own root:", rootOwner.toLowerCase() === signer.address.toLowerCase());
  console.log("");

  const baseNodeOwner = await ENS.owner(baseNode);
  console.log("ENS .base node owner:", baseNodeOwner);
  console.log("");

  console.log("To set .base node owner, you need:");
  console.log("1. Own the root node (.) OR");
  console.log("2. Own the .base node already");
  console.log("");
  console.log("Current situation:");
  if (rootOwner.toLowerCase() === signer.address.toLowerCase()) {
    console.log("✅ You own the root - you can set .base owner!");
  } else if (baseNodeOwner.toLowerCase() === signer.address.toLowerCase()) {
    console.log("✅ You own .base - you can transfer it!");
  } else {
    console.log("❌ You don't own root or .base");
    console.log("Root owner needs to transfer .base to you first");
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
