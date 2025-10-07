const hre = require("hardhat");

async function main() {
  const controllerAddress = "0x9A2cf9387d74bBa208406DC98Ba3EEE3449a17ed";
  const feeManagerAddress = "0x7b84068C4eF344bA11eF3F9D322305618Df57bBA";

  console.log("\n🔍 Checking FeeManager...\n");
  console.log("Controller:", controllerAddress);
  console.log("FeeManager:", feeManagerAddress);
  console.log("");

  const FeeManager = await hre.ethers.getContractAt(
    ["function owner() view returns (address)",
     "function isAuthorizedController(address) view returns (bool)"],
    feeManagerAddress
  );

  try {
    const owner = await FeeManager.owner();
    console.log("FeeManager owner:", owner);

    const isAuthorized = await FeeManager.isAuthorizedController(controllerAddress);
    console.log("Controller authorized:", isAuthorized ? "✅ YES" : "❌ NO");

    if (!isAuthorized) {
      console.log("\n❌ FOUND THE PROBLEM!");
      console.log("   The FeeManager doesn't recognize the new controller as authorized.");
      console.log("   We need to authorize it!");
    }
  } catch (error) {
    console.log("Error checking:", error.message);
    
    // Try without the isAuthorizedController function
    console.log("\nTrying alternative check...");
    try {
      const owner = await FeeManager.owner();
      console.log("Owner:", owner);
      console.log("\n💡 We need to authorize the controller on the FeeManager");
    } catch (e) {
      console.log("Error:", e.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
