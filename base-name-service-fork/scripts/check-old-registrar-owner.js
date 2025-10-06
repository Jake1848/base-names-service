const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const oldRegistrar = "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917";

  console.log("Your address:", signer.address);
  console.log("Old registrar:", oldRegistrar);
  console.log("");

  const OldReg = await hre.ethers.getContractFactory("BaseRegistrarImplementation");
  const oldReg = OldReg.attach(oldRegistrar);

  try {
    const owner = await oldReg.owner();
    console.log("Old registrar owner:", owner);
    console.log("You own it:", owner.toLowerCase() === signer.address.toLowerCase());

    if (owner.toLowerCase() !== signer.address.toLowerCase()) {
      console.log("");
      console.log("❌ You don't own the old registrar on mainnet!");
      console.log("You cannot transfer base node ownership.");
      console.log("");
      console.log("Options:");
      console.log("1. Contact the current owner to transfer");
      console.log("2. Keep old registrar in production");
      console.log("3. Use V2 for new registrations only");
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
