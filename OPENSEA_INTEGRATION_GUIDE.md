# OpenSea Integration Guide - Base Names

**Contract Address:** `0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca` (BaseRegistrarV2)
**Network:** Base Mainnet (Chain ID 8453)
**Token Standard:** ERC-721

---

## ✅ OpenSea Integration Status

Your Base Names NFTs are **ALREADY COMPATIBLE** with OpenSea! Here's what's working:

### 1. ERC-721 Compliance ✅
- `ownerOf()` - Returns domain owner
- `balanceOf()` - Returns user's domain count
- `transferFrom()` - Enables NFT transfers
- `approve()` - Enables marketplace approvals
- `tokenURI()` - Returns metadata JSON

### 2. On-Chain Metadata ✅
Your domains use **fully on-chain SVG metadata**, which means:
- No IPFS required
- No external server dependencies
- Metadata is permanent and immutable
- Renders directly in OpenSea

### 3. Metadata Format ✅
```json
{
  "name": "domainname.base",
  "description": "A Base Name Service domain on Base L2",
  "image": "data:image/svg+xml;base64,[SVG_DATA]",
  "attributes": [
    {
      "trait_type": "Length",
      "value": "8"
    },
    {
      "trait_type": "Tier",
      "value": "Standard"
    },
    {
      "trait_type": "Registration Date",
      "value": "2025-10-09"
    }
  ]
}
```

---

## 🔗 OpenSea Links

### Collection Page
**Auto-Generated:** OpenSea will automatically create a collection page for your contract.

**Expected URL:**
```
https://opensea.io/collection/base-registrar-v2
```

### Individual Domain
**Format:**
```
https://opensea.io/assets/base/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca/[tokenId]
```

**Example (if you own token ID 12345):**
```
https://opensea.io/assets/base/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca/12345
```

---

## 🧪 How to Test OpenSea Integration

### Test 1: View Your Domain on OpenSea

1. Register a domain on mainnet (e.g., "test123.base")
2. Get the token ID from your dashboard
3. Go to: `https://opensea.io/assets/base/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca/[YOUR_TOKEN_ID]`
4. OpenSea will automatically:
   - Fetch metadata from `tokenURI()`
   - Display the SVG image
   - Show attributes (length, tier, etc.)

### Test 2: List on OpenSea

**Option A: Use OpenSea Directly**
1. Go to your domain on OpenSea
2. Click "Sell"
3. Set price
4. List for sale

**Option B: Use Your Marketplace**
1. List on your marketplace (`basenameservice.xyz/marketplace`)
2. OpenSea will automatically detect the listing
3. Appears on both marketplaces

---

## 📊 Collection Metadata (Optional Enhancement)

To customize how your collection appears on OpenSea, you can add collection-level metadata:

### Option 1: Contract-Level Metadata (Recommended)

Add `contractURI()` function to BaseRegistrar:

```solidity
function contractURI() public pure returns (string memory) {
    return string(abi.encodePacked(
        'data:application/json;base64,',
        Base64.encode(bytes(abi.encodePacked(
            '{"name":"Base Names","description":"Decentralized naming service for Base L2",'
            '"image":"https://basenameservice.xyz/logo.png",'
            '"external_link":"https://basenameservice.xyz",'
            '"seller_fee_basis_points":250,'
            '"fee_recipient":"0x5a66231663D22d7eEEe6e2A4781050076E8a3876"}'
        )))
    ));
}
```

**What This Does:**
- Sets collection name to "Base Names"
- Adds collection description
- Sets 2.5% royalty on secondary sales
- Adds collection image and website

### Option 2: OpenSea Dashboard (No Code Required)

1. Go to https://opensea.io/collection/base-registrar-v2
2. Click "Edit Collection"
3. Add:
   - Collection name: "Base Names"
   - Logo image
   - Banner image
   - Description
   - Website: basenameservice.xyz
   - Discord/Twitter links
   - Royalty: 2.5%

---

## 🎨 Customizing NFT Appearance

Your current SVG generates beautiful domain cards. To enhance them:

### Current SVG Features ✅
- Domain name displayed
- Base logo
- Gradient background
- Clean typography

### Potential Enhancements
1. **Rarity Indicators**
   - Gold border for premium domains (1-2 chars)
   - Purple for rare (3 chars)
   - Blue for standard (4+ chars)

2. **Expiration Display**
   - Show expiration date on NFT
   - Warning indicator if expiring soon

3. **Registration Number**
   - Display "#1234" if it's the 1234th domain registered

4. **Animated SVG**
   - Subtle animations (OpenSea supports them)
   - Pulsing glow for premium domains

---

## 🔍 Verification Steps

### Step 1: Test TokenURI

```bash
# Using cast (Foundry)
cast call 0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca \
  "tokenURI(uint256)" 12345 \
  --rpc-url https://mainnet.base.org

# Should return base64-encoded JSON
```

### Step 2: Decode Metadata

```javascript
// In browser console
const tokenURI = "data:application/json;base64,eyJuYW1lIjoiLi4uIn0=";
const json = atob(tokenURI.split(',')[1]);
console.log(JSON.parse(json));
```

### Step 3: Check OpenSea

1. Visit: https://testnets.opensea.io/assets/base-sepolia/0x... (for testnet)
2. Or: https://opensea.io/assets/base/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca/... (for mainnet)
3. Click "Refresh Metadata" if image doesn't load immediately

---

## 🐛 Troubleshooting

### Issue: "NFT Not Found on OpenSea"
**Solution:**
OpenSea indexes new contracts over time. If immediate listing needed:
1. Go to https://opensea.io/get-listed
2. Submit your contract address
3. Wait 24-48 hours for indexing

### Issue: "Metadata Not Loading"
**Solution:**
1. Click "Refresh Metadata" on OpenSea
2. Wait 1-2 minutes
3. Hard refresh page (Ctrl+Shift+R)

### Issue: "Image Not Displaying"
**Solution:**
Check SVG is valid base64:
```javascript
// Test SVG decoding
const svg = atob(imageDataBase64);
console.log(svg); // Should show valid SVG
```

### Issue: "Attributes Not Showing"
**Solution:**
Attributes array must be in exact format:
```json
{
  "trait_type": "String",
  "value": "String or Number"
}
```

---

## 💰 Royalty Setup

Your marketplace charges 2.5% fee. To receive royalties on OpenSea:

### Method 1: EIP-2981 (On-Chain)

Add to BaseRegistrar:
```solidity
function royaltyInfo(uint256 tokenId, uint256 salePrice)
    external
    view
    returns (address receiver, uint256 royaltyAmount)
{
    return (owner(), (salePrice * 250) / 10000); // 2.5%
}
```

### Method 2: OpenSea Dashboard

1. Edit collection
2. Set creator earnings: 2.5%
3. Set payout address: `0x5a66231663D22d7eEEe6e2A4781050076E8a3876`

---

## 📈 Marketing on OpenSea

Once your collection is indexed:

### 1. Featured Listings
- List premium domains (1-2 character names)
- Price competitively to generate interest
- Bundle sales for discounts

### 2. Rarity System
OpenSea will automatically calculate rarity based on attributes:
- Length: 1 char (rarest), 2 char, 3 char, 4+ char
- Tier: Premium, Rare, Standard
- Registration date: Early domains are more valuable

### 3. Collection Stats
OpenSea shows:
- Floor price
- Total volume
- Number of owners
- Number of items

This creates FOMO and drives sales.

---

## ✅ Pre-Launch Checklist

Before promoting on OpenSea:

- [x] tokenURI() function working
- [x] Metadata returns valid JSON
- [x] SVG image renders correctly
- [x] Attributes array formatted correctly
- [x] Contract verified on BaseScan
- [ ] contractURI() added (optional)
- [ ] Collection logo uploaded (1000x1000px)
- [ ] Banner image uploaded (1500x500px)
- [ ] Royalty configured (2.5%)
- [ ] Social links added
- [ ] Collection description written

---

## 🚀 Going Live

1. **Register 5-10 Test Domains**
   - Mix of premium, rare, and standard
   - Creates variety in collection

2. **List Some on Marketplace**
   - Price: 0.01-0.1 ETH range
   - Shows active trading

3. **Submit to OpenSea**
   - https://opensea.io/get-listed
   - Usually indexed within 24 hours

4. **Share Collection Link**
   - Twitter: "Check out our collection on @OpenSea"
   - Discord: Pin collection link
   - Website: Add OpenSea badge

---

## 🔗 Useful Resources

**OpenSea Docs:**
- Collection Guidelines: https://docs.opensea.io/docs/getting-started
- Metadata Standards: https://docs.opensea.io/docs/metadata-standards
- Contract-Level Metadata: https://docs.opensea.io/docs/contract-level-metadata

**Testing:**
- Testnet OpenSea: https://testnets.opensea.io
- Base Sepolia Faucet: https://www.coinbase.com/faucets/base-ethereum-goerli-faucet

**Your Links:**
- Registrar: https://basescan.org/address/0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca
- Marketplace: https://basescan.org/address/0x96F308aC9AAf5416733dFc92188320D24409D4D1
- Website: basenameservice.xyz

---

## 💡 Pro Tips

1. **Early Bird Advantage**
   - First movers on OpenSea get more visibility
   - List immediately after deploying

2. **Verified Contract = Trust**
   - OpenSea shows "verified" badge
   - Increases buyer confidence

3. **Active Trading = Higher Ranking**
   - OpenSea ranks by volume
   - Encourage users to list/trade

4. **Cross-Marketplace Synergy**
   - Listings on your marketplace appear on OpenSea
   - Double the visibility!

---

**Your domains are already OpenSea-ready!** 🎉

Just register domains and they'll automatically appear on OpenSea within 24-48 hours.
