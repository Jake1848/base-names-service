const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying DomainMarketplace to Base Mainnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Base Mainnet V2 Registrar address (from your contracts.ts)
  const baseRegistrarAddress = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca";

  console.log("\n📦 Deploying DomainMarketplace...");
  console.log("Base Registrar:", baseRegistrarAddress);

  const DomainMarketplace = await hre.ethers.getContractFactory("DomainMarketplace");
  const marketplace = await DomainMarketplace.deploy(baseRegistrarAddress);

  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();

  console.log("\n✅ DomainMarketplace deployed to:", marketplaceAddress);

  // Check initial settings
  const fee = await marketplace.marketplaceFee();
  const minBid = await marketplace.minBidIncrement();

  console.log("\n📊 Initial Configuration:");
  console.log("- Marketplace Fee:", fee.toString(), "basis points (", fee/100, "%)");
  console.log("- Min Bid Increment:", minBid.toString(), "basis points (", minBid/100, "%)");
  console.log("- Owner:", await marketplace.owner());

  console.log("\n🔐 Next Steps:");
  console.log("1. Add this address to contracts.ts:");
  console.log(`   DomainMarketplace: "${marketplaceAddress}"`);
  console.log("\n2. Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network base ${marketplaceAddress} ${baseRegistrarAddress}`);
  console.log("\n3. Test marketplace functionality");

  // Save deployment info
  const deployment = {
    network: "Base Mainnet",
    chainId: 8453,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      DomainMarketplace: marketplaceAddress,
      BaseRegistrar: baseRegistrarAddress
    },
    config: {
      marketplaceFee: fee.toString(),
      minBidIncrement: minBid.toString()
    }
  };

  console.log("\n📝 Deployment Summary:");
  console.log(JSON.stringify(deployment, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
