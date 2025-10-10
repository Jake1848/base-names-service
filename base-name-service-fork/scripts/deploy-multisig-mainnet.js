const hre = require("hardhat");

async function main() {
  console.log("🔐 Deploying MultiSigAdmin to Base Mainnet...\n");

  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Owners for MultiSig (can add more later)
  const owners = [
    deployer.address, // Primary deployer
    // Add more trusted addresses here if needed
  ];

  const requiredSignatures = 1; // Require 1 signature (can increase later)

  console.log("\n📦 Deploying MultiSigAdmin...");
  console.log("Owners:", owners);
  console.log("Required signatures:", requiredSignatures);

  const MultiSigAdmin = await hre.ethers.getContractFactory("MultiSigAdmin");
  const multiSig = await MultiSigAdmin.deploy(owners, requiredSignatures);

  await multiSig.waitForDeployment();
  const multiSigAddress = await multiSig.getAddress();

  console.log("\n✅ MultiSigAdmin deployed to:", multiSigAddress);

  // Check initial settings
  const ownerCount = await multiSig.getOwnerCount();
  const required = await multiSig.required();

  console.log("\n📊 Initial Configuration:");
  console.log("- Owner Count:", ownerCount.toString());
  console.log("- Required Signatures:", required.toString());
  console.log("- Contract Balance:", await hre.ethers.provider.getBalance(multiSigAddress));

  console.log("\n🔐 Next Steps:");
  console.log("1. Add this address to contracts.ts:");
  console.log(`   MultiSigAdmin: "${multiSigAddress}"`);
  console.log("\n2. Transfer ownership of contracts to MultiSig:");
  console.log(`   - BaseRegistrar: transferOwnership(${multiSigAddress})`);
  console.log(`   - BaseController: transferOwnership(${multiSigAddress})`);
  console.log(`   - DomainMarketplace: transferOwnership(${multiSigAddress})`);
  console.log("\n3. Verify contract on BaseScan:");
  console.log(`   npx hardhat verify --network base ${multiSigAddress} "[${owners.map(o => `\\"${o}\\"`).join(',')}]" ${requiredSignatures}`);

  // Save deployment info
  const deployment = {
    network: "Base Mainnet",
    chainId: 8453,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    contracts: {
      MultiSigAdmin: multiSigAddress
    },
    config: {
      owners,
      requiredSignatures
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
