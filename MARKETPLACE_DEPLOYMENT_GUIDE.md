# Base Names Marketplace - Deployment & Testing Guide

**Date:** October 9, 2025
**Status:** ✅ Live on Base Mainnet
**Frontend URL:** http://localhost:3000

---

## 🎉 What's Been Deployed

### Smart Contracts (Base Mainnet - Chain ID 8453)

| Contract | Address | Status |
|----------|---------|--------|
| DomainMarketplace | `0x35FF50Fd54e7de7CBc5722C9d380966db049e573` | ✅ Deployed |
| BaseRegistrarV2 | `0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca` | ✅ Deployed |
| BaseControllerV2 | `0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8` | ✅ Deployed |
| ENS Registry | `0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E` | ✅ Deployed |
| PublicResolver | `0x5D5bC53bDa5105561371FEf50B50E03aA94c962E` | ✅ Deployed |

### Frontend Integration

- ✅ Marketplace address added to `contracts.ts`
- ✅ Marketplace ABI integrated
- ✅ Build successful (Next.js 15.5.4)
- ✅ Dev server running on http://localhost:3000

---

## 🧪 Testing Checklist

### 1. Test Mainnet Domain Registration

**Goal:** Register a domain on Base Mainnet

**Steps:**
1. Navigate to http://localhost:3000
2. Connect wallet (make sure you're on Base Mainnet - Chain ID 8453)
3. Search for a domain (e.g., "test123.base")
4. Click "Register" and complete the 2-step process:
   - **Step 1:** Commit transaction (wait 60 seconds)
   - **Step 2:** Register transaction (pay fee)
5. Verify domain appears in your dashboard

**What to Check:**
- ✅ Wallet connects to Base Mainnet
- ✅ Domain shows as available
- ✅ Price displays correctly
- ✅ Commit succeeds
- ✅ Register succeeds after 60s wait
- ✅ NFT metadata displays correctly
- ✅ Domain appears in dashboard

**BaseScan Links:**
- [View BaseRegistrar on BaseScan](https://basescan.org/address/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca)
- [View BaseController on BaseScan](https://basescan.org/address/0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8)

---

### 2. Test NFT Metadata Display

**Goal:** Verify SVG metadata renders correctly

**Steps:**
1. After registering a domain, go to Dashboard
2. Click on your domain NFT
3. Verify the SVG image displays with:
   - Domain name (e.g., "test123.base")
   - Base logo
   - Gradient background
   - Correct colors

**What to Check:**
- ✅ tokenURI returns valid data
- ✅ SVG renders in browser
- ✅ OpenSea/marketplaces can fetch metadata
- ✅ Image displays on dashboard

**Test on OpenSea:**
- Go to https://opensea.io/assets/base/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca/[tokenId]
- Replace `[tokenId]` with your domain's token ID

---

### 3. Test Marketplace Listing

**Goal:** List a domain for sale on the marketplace

**Prerequisites:**
- You must own a .base domain (register one first)

**Steps:**
1. Go to Dashboard (http://localhost:3000/dashboard)
2. Find your owned domain
3. Click "List for Sale"
4. Enter price in ETH (e.g., "0.1")
5. **IMPORTANT:** Approve marketplace contract to transfer NFT
6. Confirm listing transaction
7. Verify domain appears on Marketplace page

**What to Check:**
- ✅ Domain owner can list
- ✅ NFT approval transaction works
- ✅ Listing transaction succeeds
- ✅ Domain appears on marketplace
- ✅ Listed event emitted
- ✅ Domain transferred to marketplace contract

**Transaction Details:**
```solidity
// Approve marketplace
BaseRegistrar.approve(0x35FF50Fd54e7de7CBc5722C9d380966db049e573, tokenId)

// Create listing
DomainMarketplace.createListing(tokenId, priceInWei)
```

---

### 4. Test Marketplace Buying

**Goal:** Buy a listed domain from marketplace

**Prerequisites:**
- A domain must be listed (do step 3 first, or buy someone else's)

**Steps:**
1. Go to Marketplace page (http://localhost:3000/marketplace)
2. Find a listed domain
3. Click "Buy Now"
4. Confirm transaction with correct ETH amount
5. Wait for confirmation
6. Verify domain transferred to your address
7. Check domain appears in your dashboard

**What to Check:**
- ✅ Price displays correctly
- ✅ Buy transaction includes correct ETH
- ✅ Marketplace fee (2.5%) calculated correctly
- ✅ Seller receives proceeds (97.5%)
- ✅ NFT transferred to buyer
- ✅ Listing marked inactive
- ✅ Sold event emitted

**Fee Breakdown (Example: 0.1 ETH sale):**
- Total Paid: 0.1 ETH
- Marketplace Fee (2.5%): 0.0025 ETH
- Seller Receives: 0.0975 ETH

---

### 5. Test Marketplace Cancellation

**Goal:** Cancel a listing and get domain back

**Steps:**
1. Go to Dashboard
2. Find your listed domain
3. Click "Cancel Listing"
4. Confirm transaction
5. Verify domain returned to your address
6. Check domain no longer appears on marketplace

**What to Check:**
- ✅ Only seller can cancel
- ✅ NFT returned to seller
- ✅ Listing marked inactive
- ✅ ListingCancelled event emitted

---

## 🐛 Known Issues to Test For

### Critical Issues

1. **Marketplace Fee Accounting Bug** ⚠️
   - **Location:** DomainMarketplace.sol line 390-399
   - **Issue:** `withdrawFees()` withdraws entire contract balance, including active auction bids
   - **Risk:** Owner could drain funds that belong to bidders
   - **Status:** 🔴 NOT FIXED YET
   - **Test:** Don't use `withdrawFees()` if there are active auctions

2. **NFT Approval Required**
   - **Issue:** Users must approve marketplace before listing
   - **UX:** May confuse users (requires 2 transactions)
   - **Solution:** Add clear approval step in UI

3. **Price Display**
   - **Issue:** Ensure prices show in ETH, not Wei
   - **Test:** Verify 0.1 ETH displays as "0.1 ETH", not "100000000000000000"

---

## 📊 Mainnet Testing Scenarios

### Scenario 1: First-Time User Journey
```
1. Connect wallet → Base Mainnet
2. Search "myname.base"
3. See price: 0.01 ETH (standard tier)
4. Click Register
5. Commit (wait 60s)
6. Register (pay 0.01 ETH)
7. View in dashboard
8. See NFT metadata with SVG
```

### Scenario 2: Seller Flow
```
1. Own "myname.base"
2. Go to dashboard
3. Click "List for Sale"
4. Set price: 0.1 ETH
5. Approve marketplace contract
6. Create listing
7. Domain appears on marketplace
8. Wait for buyer...
9. Receive 0.0975 ETH when sold (97.5%)
```

### Scenario 3: Buyer Flow
```
1. Browse marketplace
2. Find "myname.base" listed for 0.1 ETH
3. Click "Buy Now"
4. Pay 0.1 ETH
5. Receive NFT
6. Domain appears in dashboard
7. Can now list it again or keep it
```

---

## 🔍 How to Debug Issues

### Check Contract on BaseScan

**DomainMarketplace:**
https://basescan.org/address/0x35FF50Fd54e7de7CBc5722C9d380966db049e573

**Read Contract Functions:**
- `getListing(tokenId)` - Check if domain is listed
- `isListed(tokenId)` - Returns true/false
- `marketplaceFee()` - Should return 250 (2.5%)

**Events to Monitor:**
- `Listed` - When domain listed
- `Sold` - When domain sold
- `ListingCancelled` - When listing cancelled

### Common Transaction Failures

| Error | Cause | Solution |
|-------|-------|----------|
| "Not domain owner" | User doesn't own NFT | Register domain first |
| "Already listed" | Domain already on marketplace | Cancel existing listing |
| "Not listed" | Trying to buy unlisted domain | Verify domain is listed |
| "Insufficient payment" | Not enough ETH sent | Check correct price |
| "Transfer to seller failed" | Seller address issue | Contact support |

---

## 💰 Gas Costs (Estimated)

| Action | Gas (Gwei) | Cost @ 0.1 Gwei |
|--------|-----------|----------------|
| Register Domain | ~200,000 | ~$0.05 |
| Approve Marketplace | ~50,000 | ~$0.01 |
| Create Listing | ~100,000 | ~$0.025 |
| Buy Listing | ~150,000 | ~$0.0375 |
| Cancel Listing | ~80,000 | ~$0.02 |

*Base L2 fees are very low compared to Ethereum mainnet*

---

## 🚀 Next Steps for Coinbase Pitch

Once you've tested and verified everything works:

1. ✅ **Mainnet Registration** - Register 3-5 test domains
2. ✅ **Marketplace Test** - List and buy at least 1 domain
3. ✅ **NFT Verification** - Verify metadata on OpenSea
4. 📹 **Record Demo Video** - Use script in `ACQUISITION_PACKAGE/05_DEMO_VIDEO_SCRIPT.md`
5. 📧 **Send Email** - Use template in `ACQUISITION_PACKAGE/06_EMAIL_TEMPLATES.md`

---

## 📝 Testing Log

Use this section to track your testing:

### Domain Registrations
- [ ] Domain 1: ____________ (TokenID: _____)
- [ ] Domain 2: ____________ (TokenID: _____)
- [ ] Domain 3: ____________ (TokenID: _____)

### Marketplace Transactions
- [ ] Listed: ____________ for ____ ETH (Tx: ____________)
- [ ] Bought: ____________ for ____ ETH (Tx: ____________)
- [ ] Cancelled: ____________ (Tx: ____________)

### Issues Found
- [ ] Issue 1: ________________________________
- [ ] Issue 2: ________________________________
- [ ] Issue 3: ________________________________

---

## 🔗 Important Links

**Frontend:**
- Local: http://localhost:3000
- Marketplace: http://localhost:3000/marketplace
- Dashboard: http://localhost:3000/dashboard

**BaseScan:**
- Marketplace: https://basescan.org/address/0x35FF50Fd54e7de7CBc5722C9d380966db049e573
- Registrar: https://basescan.org/address/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca
- Controller: https://basescan.org/address/0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8

**Documentation:**
- Acquisition Package: `ACQUISITION_PACKAGE/README.md`
- Investment Report: `COINBASE_INVESTMENT_READINESS_REPORT.md`

---

## ❓ FAQ

**Q: Do I need real ETH on Base Mainnet?**
A: Yes, you need real ETH on Base L2 to register domains and pay gas fees. Bridge from Ethereum or buy on an exchange.

**Q: How long does domain registration take?**
A: 2 transactions: Commit (instant) → Wait 60 seconds → Register (instant). Total ~1-2 minutes.

**Q: Can I test on Sepolia testnet first?**
A: Yes, but marketplace is only deployed on mainnet. Sepolia has registration working though.

**Q: What if I find a bug?**
A: Document it in the testing log above and note the transaction hash for debugging.

**Q: Can I cancel a domain registration?**
A: No, once registered it's yours. But you can list it for sale on the marketplace.

**Q: What's the minimum domain length?**
A: 1 character minimum. Pricing tiers: 1-2 chars (premium), 3 chars (rare), 4+ chars (standard).

---

**Ready to test? Start with Test #1 above!** 🚀
