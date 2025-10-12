const hre = require("hardhat");

async function main() {
  const TEST_MINTER = "0x8c8433998F9c980524BC46118c73c6Db63e244F8";
  const DOMAIN = "demo123test";
  const OWNER = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
  const DURATION = 365 * 24 * 60 * 60; // 1 year

  console.log("🎁 Minting test domain for FREE...\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Operating as:", signer.address);

  const TestMinter = await hre.ethers.getContractAt("TestMinter", TEST_MINTER);

  // Check availability
  console.log(`\n📝 Checking if "${DOMAIN}.base" is available...`);
  const available = await TestMinter.isAvailable(DOMAIN);

  if (!available) {
    console.error(`❌ Domain "${DOMAIN}.base" is already registered!`);
    console.log("\n💡 Try a different name or check on BaseScan");
    process.exit(1);
  }

  console.log(`✅ Domain is available!\n`);

  console.log("🎨 Minting domain:");
  console.log("   Label:", DOMAIN);
  console.log("   Full name:", `${DOMAIN}.base`);
  console.log("   Owner:", OWNER);
  console.log("   Duration:", "365 days");

  console.log("\n⏳ Sending transaction...");
  const tx = await TestMinter.testMint(DOMAIN, OWNER, DURATION);

  console.log("   Transaction hash:", tx.hash);
  console.log("   Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

  // Calculate expiry
  const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
  const expiryTimestamp = Number(block.timestamp) + DURATION;
  const expiryDate = new Date(expiryTimestamp * 1000);

  const gasUsed = Number(receipt.gasUsed);
  const gasPrice = Number(receipt.gasPrice || 0);
  const gasCost = (gasUsed * gasPrice) / 1e18;

  console.log("\n🎉 SUCCESS! Domain minted for FREE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   Domain:    " + DOMAIN + ".base");
  console.log("   Owner:     " + OWNER);
  console.log("   Expires:   " + expiryDate.toLocaleDateString());
  console.log("   Gas used:  " + gasUsed);
  console.log("   Gas cost:  " + gasCost.toFixed(6) + " ETH");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n💡 View on BaseScan:");
  console.log(`   https://basescan.org/tx/${tx.hash}`);

  console.log("\n✅ No payment required - completely FREE!");
  console.log("   (Regular registration would cost ~0.001-0.01 ETH)");

  console.log("\n🎯 Now you can:");
  console.log("   - Register 'jake.base' the same way");
  console.log("   - List this domain on the marketplace");
  console.log("   - Test buying/selling flows");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
