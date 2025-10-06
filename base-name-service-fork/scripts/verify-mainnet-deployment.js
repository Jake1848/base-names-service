const hre = require("hardhat");

async function main() {
  const address = "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00";
  
  console.log("Checking address:", address);
  console.log("");

  // Check if it's a contract
  const code = await hre.ethers.provider.getCode(address);
  console.log("Is contract:", code !== "0x");
  console.log("");

  if (code === "0x") {
    console.log("❌ No contract at this address!");
    return;
  }

  // Try to call it as registrar V2
  try {
    const V2 = await hre.ethers.getContractFactory("BaseRegistrarImplementationV2");
    const v2 = V2.attach(address);

    const name = await v2.name();
    const symbol = await v2.symbol();
    console.log("Name:", name);
    console.log("Symbol:", symbol);
    console.log("");
    console.log("✅ This IS a BaseRegistrarV2!");
  } catch (e) {
    console.log("❌ NOT a BaseRegistrarV2");
    console.log("Error:", e.message);

    // Try as ENS
    try {
      const ENS = await hre.ethers.getContractAt(
        ["function owner(bytes32 node) external view returns (address)"],
        address
      );
      const rootOwner = await ENS.owner("0x0000000000000000000000000000000000000000000000000000000000000000");
      console.log("This might be an ENS registry, root owner:", rootOwner);
    } catch (e2) {
      console.log("Also not ENS");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
