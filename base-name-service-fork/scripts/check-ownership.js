const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  console.log("Your address:", signer.address);
  console.log("");

  // Addresses
  const oldRegistrar = "0x69b81319958388b5133DF617Ba542FB6c9e03177";
  const ensRegistry = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";
  const baseNode = "0x0902329b42866a8e566c30c58f4c3e1b42c05c82b5e42619c478968c7c1f2a79";

  // Check old registrar owner
  const OldReg = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldReg = OldReg.attach(oldRegistrar);

  try {
    const owner = await oldReg.owner();
    console.log("Old Registrar owner:", owner);
    console.log("You own it:", owner.toLowerCase() === signer.address.toLowerCase());
  } catch (e) {
    console.log("Error checking registrar owner:", e.message);
  }

  console.log("");

  // Check ENS registry base node owner
  const ENS = await hre.ethers.getContractAt(
    ["function owner(bytes32 node) external view returns (address)"],
    ensRegistry
  );

  try {
    const baseNodeOwner = await ENS.owner(baseNode);
    console.log("ENS .base node owner:", baseNodeOwner);
    console.log("Is old registrar:", baseNodeOwner.toLowerCase() === oldRegistrar.toLowerCase());
  } catch (e) {
    console.log("Error checking base node owner:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
