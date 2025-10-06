const hre = require("hardhat");

async function main() {
  const [signer] = await hre.ethers.getSigners();
  const registrarV2 = "0x944C89806e1BF7F0Ce48Ffbd5324faa181B79ba9";

  const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
  const v2 = V2.attach(registrarV2);

  const owner = await v2.owner();
  console.log("Your address:", signer.address);
  console.log("V2 Registrar owner:", owner);
  console.log("You own it:", owner.toLowerCase() === signer.address.toLowerCase());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
