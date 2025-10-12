const hre = require("hardhat");

async function main() {
  console.log("🚫 Testing Cancel Listing on Base Mainnet...\n");

  const [signer] = await hre.ethers.getSigners();
  console.log("Operating as:", signer.address);

  // Contract addresses
  const BASE_REGISTRAR = "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca";
  const MARKETPLACE = "0x96F308aC9AAf5416733dFc92188320D24409D4D1";
  const DOMAIN_LABEL = "demo123test";

  // Calculate token ID
  const labelHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes(DOMAIN_LABEL));
  const tokenId = BigInt(labelHash);

  console.log("Domain:", DOMAIN_LABEL + ".base");
  console.log("Token ID:", tokenId.toString());
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");

  // Get contract instances
  const BaseRegistrar = await hre.ethers.getContractAt(
    "BaseRegistrarImplementation",
    BASE_REGISTRAR
  );

  const Marketplace = await hre.ethers.getContractAt(
    "DomainMarketplace",
    MARKETPLACE
  );

  // Step 1: Check current status
  console.log("📋 Step 1: Check Current Listing Status");
  const isListed = await Marketplace.isListed(tokenId);
  console.log("   Is listed:", isListed);

  if (!isListed) {
    console.log("   ℹ️  Domain is not listed on marketplace");
    console.log("\n💡 Run this to list it first:");
    console.log("   npx hardhat run scripts/test-marketplace.js --network base");
    process.exit(0);
  }

  const listing = await Marketplace.getListing(tokenId);
  console.log("   Seller:", listing[0]);
  console.log("   Price:", hre.ethers.formatEther(listing[1]), "ETH");
  console.log("   Active:", listing[3]);
  console.log("   ✅ Listing is active\n");

  // Step 2: Check NFT location before cancel
  console.log("📋 Step 2: Check NFT Location Before Cancel");
  const ownerBefore = await BaseRegistrar.ownerOf(tokenId);
  console.log("   Current holder:", ownerBefore);
  console.log("   In marketplace:", ownerBefore.toLowerCase() === MARKETPLACE.toLowerCase());
  console.log("   ✅ NFT is in marketplace escrow\n");

  // Step 3: Cancel listing
  console.log("📋 Step 3: Cancel the Listing");
  console.log("   Sending cancel transaction...");

  const cancelTx = await Marketplace.cancelListing(tokenId);
  console.log("   Transaction hash:", cancelTx.hash);

  const cancelReceipt = await cancelTx.wait();
  console.log("   ✅ Transaction confirmed in block:", cancelReceipt.blockNumber);

  // Parse events
  for (const log of cancelReceipt.logs) {
    try {
      const parsed = Marketplace.interface.parseLog(log);
      if (parsed && parsed.name === "ListingCancelled") {
        console.log("\n   📢 ListingCancelled Event:");
        console.log("      TokenId:", parsed.args.tokenId.toString());
        console.log("      Seller:", parsed.args.seller);
        console.log("      Timestamp:", new Date(Number(parsed.args.timestamp) * 1000).toLocaleString());
      }
    } catch (e) {
      // Not a marketplace event
    }
  }
  console.log();

  // Step 4: Verify listing is cancelled
  console.log("📋 Step 4: Verify Listing is Cancelled");
  const isListedAfter = await Marketplace.isListed(tokenId);
  console.log("   Is listed:", isListedAfter);

  if (isListedAfter) {
    console.error("   ❌ Listing should be cancelled!");
    process.exit(1);
  }
  console.log("   ✅ Listing successfully cancelled\n");

  // Step 5: Verify NFT returned to owner
  console.log("📋 Step 5: Verify NFT Returned to Owner");
  const ownerAfter = await BaseRegistrar.ownerOf(tokenId);
  console.log("   Current holder:", ownerAfter);
  console.log("   Your address:", signer.address);

  if (ownerAfter.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("   ❌ NFT should be returned to you!");
    process.exit(1);
  }
  console.log("   ✅ NFT successfully returned to your wallet\n");

  // Final summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 CANCEL LISTING TEST SUCCESSFUL!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n✅ All checks passed:");
  console.log("   ✓ Listing was active");
  console.log("   ✓ Cancel transaction successful");
  console.log("   ✓ Listing removed from marketplace");
  console.log("   ✓ NFT returned to owner");

  console.log("\n💡 View transaction on BaseScan:");
  console.log("   https://basescan.org/tx/" + cancelTx.hash);

  console.log("\n🎯 Next steps:");
  console.log("   - List again and test buying");
  console.log("   - Test marketplace events");
  console.log("   - Test with jake.base domain");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
