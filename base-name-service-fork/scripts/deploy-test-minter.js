const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying TestMinter to Base Mainnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying from:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "ETH\n");

  // Base Mainnet BaseRegistrar address
  const BASE_REGISTRAR = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca";

  console.log("Deploying TestMinter...");
  const TestMinter = await hre.ethers.getContractFactory("TestMinter");
  const testMinter = await TestMinter.deploy(BASE_REGISTRAR);
  await testMinter.waitForDeployment();

  const address = await testMinter.getAddress();
  console.log("✅ TestMinter deployed to:", address);

  console.log("\n📋 Next steps:");
  console.log("1. Authorize TestMinter as a controller:");
  console.log(`   node scripts/authorize-test-minter.js ${address}`);
  console.log("\n2. Mint a test domain:");
  console.log(`   node scripts/mint-test-domain.js testdomain your-address`);

  console.log("\n⚠️  Save this address:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
