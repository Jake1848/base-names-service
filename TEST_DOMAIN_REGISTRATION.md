# Testing Domain Registration - CHEAP Method

## 🎯 Cheapest Way to Test

### Option 1: Long Domain for 1 Day (CHEAPEST - ~$0.04)

**Register a 5+ character domain for just 1 day:**

1. Go to your website
2. Search: "testdomain" (9+ chars = cheapest)
3. Price: 0.005 ETH / 365 = **0.0000137 ETH ≈ $0.04**
4. Register for 1 day minimum
5. Total cost: $0.04 + gas (~$0.50) = **~$0.54 total**

### Option 2: Free Testnet Testing

Instead of spending real money, deploy to **Base Sepolia testnet** (free!):

1. Get free Sepolia ETH from faucet
2. Deploy contracts to testnet
3. Test everything for FREE
4. Move to mainnet when ready

## 🔧 How to Register a 1-Day Domain (Mainnet)

The frontend currently hardcodes 1 year. You need to modify it temporarily:

### Quick Frontend Fix for Testing:

```javascript
// In src/app/page.tsx, line 344
// CHANGE THIS:
BigInt(365 * 24 * 60 * 60),  // 1 year

// TO THIS:
BigInt(1 * 24 * 60 * 60),  // 1 day
```

Then rebuild and test with a long domain name!

## 💰 Cost Comparison

| Domain Length | 1 Year | 1 Day | Gas | Total (1 Day) |
|---------------|--------|-------|-----|---------------|
| 5+ chars | $15 | $0.04 | $0.50 | **$0.54** |
| 4 chars | $150 | $0.41 | $0.50 | $0.91 |
| 3 chars | $1500 | $4.10 | $0.50 | $4.60 |

## 🎁 BETTER SOLUTION: Use Sepolia Testnet (FREE!)

This is what I recommend:

```bash
# 1. Get free test ETH
Visit: https://sepoliafaucet.com
Enter your address: 0x5a66231663D22d7eEEe6e2A4781050076E8a3876

# 2. Deploy to testnet (FREE - no real ETH needed)
cd base-name-service-fork
npx hardhat run --network base-sepolia scripts/deploy-all-sepolia.js

# 3. Update frontend with testnet addresses
# Edit src/lib/contracts.ts to use BASE_SEPOLIA contracts

# 4. Test everything for FREE
# Register unlimited domains with fake ETH
```

## ⚡ Quick Test Script

Want to test the contract directly without the frontend?

```bash
cd base-name-service-fork

# Create test registration script
cat > scripts/test-register-cheap.js << 'SCRIPT'
const { ethers } = require("hardhat");

async function main() {
    const [signer] = await ethers.getSigners();
    const controller = await ethers.getContractAt(
        "ETHRegistrarController",
        "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e"
    );

    const domain = "testdomain12345"; // Long = cheap
    const duration = 1 * 24 * 60 * 60; // 1 day
    
    // Get price
    const priceOracle = await ethers.getContractAt(
        "BasePriceOracle",
        "0xA1805458A1C1294D53eBBBd025B397F89Dd963AC"
    );
    const price = await priceOracle.price(domain, 0, duration);
    console.log("Price:", ethers.formatEther(price.base), "ETH");
    
    // Register would go here...
}

main().catch(console.error);
SCRIPT

npx hardhat run --network base scripts/test-register-cheap.js
```

## 🎯 MY RECOMMENDATION

**For testing, use Sepolia testnet (100% free):**

Pros:
- ✅ Unlimited free testing
- ✅ No real money spent
- ✅ Same exact code/contracts
- ✅ Test all features
- ✅ Once verified, deploy to mainnet

Cons:
- ❌ Need to deploy contracts (but I can help)
- ❌ Need testnet ETH (but it's free from faucet)

**Want me to deploy everything to Sepolia testnet so you can test for FREE?**
