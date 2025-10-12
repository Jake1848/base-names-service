const hre = require("hardhat");

async function main() {
  const domainLabel = process.argv[2];
  const ownerAddress = process.argv[3];

  if (!domainLabel || !ownerAddress) {
    console.error("❌ Usage: node scripts/mint-test-domain.js <domain-label> <owner-address>");
    console.error("\nExample:");
    console.error("  node scripts/mint-test-domain.js mytest 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb");
    process.exit(1);
  }

  // Get TestMinter address from environment
  const TEST_MINTER = process.env.TEST_MINTER_ADDRESS || "0x8c8433998F9c980524BC46118c73c6Db63e244F8";

  if (!TEST_MINTER) {
    console.error("❌ Please set TEST_MINTER_ADDRESS environment variable");
    console.error("   export TEST_MINTER_ADDRESS=<your-test-minter-address>");
    process.exit(1);
  }

  console.log("Using TestMinter:", TEST_MINTER);

  console.log("🎁 Minting test domain for FREE...\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Operating as:", signer.address);

  const TestMinter = await hre.ethers.getContractAt("TestMinter", TEST_MINTER);

  // Check if owner
  const owner = await TestMinter.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("❌ You are not the owner of TestMinter!");
    console.error("   Owner:", owner);
    process.exit(1);
  }

  // Check if available
  console.log(`📝 Checking if "${domainLabel}.base" is available...`);
  const available = await TestMinter.isAvailable(domainLabel);

  if (!available) {
    console.error(`❌ Domain "${domainLabel}.base" is not available!`);
    process.exit(1);
  }

  console.log(`✅ Domain is available!\n`);

  // Mint for 365 days (1 year)
  const duration = 365 * 24 * 60 * 60; // 1 year in seconds

  console.log("🎨 Minting domain:");
  console.log("   Label:", domainLabel);
  console.log("   Full name:", `${domainLabel}.base`);
  console.log("   Owner:", ownerAddress);
  console.log("   Duration:", "365 days");

  const tx = await TestMinter.testMint(domainLabel, ownerAddress, duration);
  console.log("\n⏳ Transaction hash:", tx.hash);
  console.log("   Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed!");

  // Calculate expiry
  const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
  const expiryTimestamp = Number(block.timestamp) + duration;
  const expiryDate = new Date(expiryTimestamp * 1000);

  console.log("\n🎉 Success! Domain minted for FREE!");
  console.log("   Domain:", `${domainLabel}.base`);
  console.log("   Owner:", ownerAddress);
  console.log("   Expires:", expiryDate.toLocaleDateString());
  console.log("\n💡 View on BaseScan:");
  console.log(`   https://basescan.org/tx/${tx.hash}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
