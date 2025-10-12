const hre = require("hardhat");

async function main() {
  console.log("🏪 Testing Marketplace on Base Mainnet...\n");

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

  // Step 1: Verify ownership
  console.log("📋 Step 1: Verify Ownership");
  const owner = await BaseRegistrar.ownerOf(tokenId);
  console.log("   Owner:", owner);

  if (owner.toLowerCase() !== signer.address.toLowerCase()) {
    console.error("❌ You don't own this domain!");
    process.exit(1);
  }
  console.log("   ✅ You own the domain\n");

  // Step 2: Check if already listed
  console.log("📋 Step 2: Check Current Listing Status");
  const isListed = await Marketplace.isListed(tokenId);
  console.log("   Currently listed:", isListed);

  if (isListed) {
    console.log("   ℹ️  Domain is already listed, will test cancel instead\n");

    console.log("📋 Step 3: Cancel Existing Listing");
    console.log("   Sending cancel transaction...");

    const cancelTx = await Marketplace.cancelListing(tokenId);
    console.log("   Transaction hash:", cancelTx.hash);
    await cancelTx.wait();
    console.log("   ✅ Listing cancelled!\n");

    // Verify ownership returned
    const newOwner = await BaseRegistrar.ownerOf(tokenId);
    console.log("   Domain returned to:", newOwner);
    console.log("   ✅ Domain back in your wallet\n");

    return;
  }
  console.log("   ✅ Not listed yet\n");

  // Step 3: Approve marketplace
  console.log("📋 Step 3: Approve Marketplace to Transfer NFT");

  const approved = await BaseRegistrar.getApproved(tokenId);
  console.log("   Current approval:", approved);

  if (approved.toLowerCase() !== MARKETPLACE.toLowerCase()) {
    console.log("   Approving marketplace...");
    const approveTx = await BaseRegistrar.approve(MARKETPLACE, tokenId);
    console.log("   Transaction hash:", approveTx.hash);
    await approveTx.wait();
    console.log("   ✅ Marketplace approved!\n");
  } else {
    console.log("   ✅ Already approved\n");
  }

  // Step 4: List on marketplace
  console.log("📋 Step 4: List Domain on Marketplace");
  const listingPrice = hre.ethers.parseEther("0.001"); // 0.001 ETH
  console.log("   Price:", hre.ethers.formatEther(listingPrice), "ETH");
  console.log("   Creating listing...");

  const listTx = await Marketplace.createListing(tokenId, listingPrice);
  console.log("   Transaction hash:", listTx.hash);

  const listReceipt = await listTx.wait();
  console.log("   ✅ Listed successfully in block:", listReceipt.blockNumber);

  // Parse events
  for (const log of listReceipt.logs) {
    try {
      const parsed = Marketplace.interface.parseLog(log);
      if (parsed && parsed.name === "Listed") {
        console.log("\n   📢 Listed Event:");
        console.log("      TokenId:", parsed.args.tokenId.toString());
        console.log("      Seller:", parsed.args.seller);
        console.log("      Price:", hre.ethers.formatEther(parsed.args.price), "ETH");
        console.log("      Timestamp:", new Date(Number(parsed.args.timestamp) * 1000).toLocaleString());
      }
    } catch (e) {
      // Not a marketplace event
    }
  }
  console.log();

  // Step 5: Verify listing
  console.log("📋 Step 5: Verify Listing is Active");

  const listing = await Marketplace.getListing(tokenId);
  console.log("   Seller:", listing[0]);
  console.log("   Price:", hre.ethers.formatEther(listing[1]), "ETH");
  console.log("   Created:", new Date(Number(listing[2]) * 1000).toLocaleString());
  console.log("   Active:", listing[3]);

  if (!listing[3]) {
    console.error("   ❌ Listing is not active!");
    process.exit(1);
  }
  console.log("   ✅ Listing is active!\n");

  // Step 6: Check NFT is in escrow
  console.log("📋 Step 6: Verify NFT is in Marketplace Escrow");
  const currentOwner = await BaseRegistrar.ownerOf(tokenId);
  console.log("   Current holder:", currentOwner);

  if (currentOwner.toLowerCase() !== MARKETPLACE.toLowerCase()) {
    console.error("   ❌ NFT should be in marketplace escrow!");
    process.exit(1);
  }
  console.log("   ✅ NFT is safely held by marketplace\n");

  // Final summary
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 MARKETPLACE TEST SUCCESSFUL!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("\n✅ All checks passed:");
  console.log("   ✓ Domain ownership verified");
  console.log("   ✓ Marketplace approved");
  console.log("   ✓ Domain listed successfully");
  console.log("   ✓ Listing is active");
  console.log("   ✓ NFT in marketplace escrow");

  console.log("\n💡 View listing on BaseScan:");
  console.log("   https://basescan.org/tx/" + listTx.hash);

  console.log("\n💡 View on your frontend:");
  console.log("   https://your-vercel-app.vercel.app/marketplace");

  console.log("\n🎯 Next steps:");
  console.log("   - Test buying from another wallet");
  console.log("   - Test canceling the listing");
  console.log("   - Test marketplace event listeners");

  console.log("\n📝 To cancel this listing, run:");
  console.log("   npx hardhat run scripts/test-marketplace.js --network base");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
