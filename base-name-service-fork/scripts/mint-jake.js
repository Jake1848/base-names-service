const hre = require("hardhat");

async function main() {
  console.log("🎁 Minting 'jake.base' for FREE...\n");

  // Your address from the transaction data
  const OWNER = "0x5a66231663D22d7eEEe6e2A4781050076E8a3876";
  const LABEL = "jake";
  const DURATION = 365 * 24 * 60 * 60; // 365 days

  // Get TestMinter address from environment or use deployed address
  const TEST_MINTER = process.env.TEST_MINTER_ADDRESS || "0x8c8433998F9c980524BC46118c73c6Db63e244F8";

  console.log("Using TestMinter:", TEST_MINTER);

  const [signer] = await hre.ethers.getSigners();
  console.log("Operating as:", signer.address);

  const TestMinter = await hre.ethers.getContractAt("TestMinter", TEST_MINTER);

  // Check ownership
  const owner = await TestMinter.owner();
  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("❌ You are not the owner of TestMinter!");
    console.error("   Owner:", owner);
    console.error("   You:", signer.address);
    process.exit(1);
  }

  // Check availability
  console.log(`📝 Checking if "${LABEL}.base" is available...`);
  const available = await TestMinter.isAvailable(LABEL);

  if (!available) {
    console.error(`❌ Domain "${LABEL}.base" is already registered!`);
    console.error("\n💡 Try checking who owns it:");
    console.error(`   https://basescan.org/token/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca?a=${LABEL}`);
    process.exit(1);
  }

  console.log(`✅ Domain is available!\n`);

  console.log("🎨 Minting domain:");
  console.log("   Label:", LABEL);
  console.log("   Full name:", `${LABEL}.base`);
  console.log("   Owner:", OWNER);
  console.log("   Duration:", "365 days (31,536,000 seconds)");

  console.log("\n⏳ Sending transaction...");
  const tx = await TestMinter.testMint(LABEL, OWNER, DURATION);

  console.log("   Transaction hash:", tx.hash);
  console.log("   Waiting for confirmation...");

  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

  // Calculate expiry
  const block = await hre.ethers.provider.getBlock(receipt.blockNumber);
  const expiryTimestamp = Number(block.timestamp) + DURATION;
  const expiryDate = new Date(expiryTimestamp * 1000);

  console.log("\n🎉 SUCCESS! Domain minted for FREE!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("   Domain:   jake.base");
  console.log("   Owner:    " + OWNER);
  console.log("   Expires:  " + expiryDate.toLocaleDateString());
  console.log("   Token ID: " + hre.ethers.keccak256(hre.ethers.toUtf8Bytes(LABEL)));
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

  console.log("\n💡 View transaction on BaseScan:");
  console.log(`   https://basescan.org/tx/${tx.hash}`);

  console.log("\n💡 View your domain:");
  console.log(`   https://basescan.org/token/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca?a=${LABEL}`);

  console.log("\n✅ No payment required - completely FREE!");
  console.log("   (Only gas cost: ~" + (Number(receipt.gasUsed) * 0.000000001).toFixed(6) + " ETH)");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
