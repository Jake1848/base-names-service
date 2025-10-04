# How to Buy a .base Domain & Where the Money Goes

## 🛒 HOW TO BUY A DOMAIN (User Perspective)

### Step 1: Go to Your Website
Visit your deployed site (e.g., basenames.vercel.app)

### Step 2: Connect Wallet
Click "Connect Wallet" and connect MetaMask/Coinbase Wallet

### Step 3: Search for Domain
- Enter desired name (e.g., "myname")
- System checks availability
- Shows price (based on length):
  - 3 chars: ~$640/year
  - 4 chars: ~$160/year  
  - 5+ chars: ~$5/year

### Step 4: Register
- Click "Register"
- Approve transaction in wallet
- Pay ETH (price + gas)
- Domain NFT mints to your wallet

### Step 5: View in Dashboard
- Go to Dashboard page
- See your domain
- Set resolver records
- Manage renewal

## 💰 WHERE THE MONEY GOES

### The Payment Flow:

```
User Pays ETH
     ↓
BaseController Contract (0xca7FD90f4C76FbCdbdBB3427804374b16058F55e)
     ↓ (ETH accumulates here)
     ↓
Owner calls withdraw()
     ↓
FeeManager Contract (0xab30D0F58442c63C40977045433653A027733961)
     ↓
Final destination (beneficiary address in FeeManager)
```

### Who Controls It:

**YOU Control Everything:**
- **BaseController Owner:** `0x5a66231663D22d7eEEe6e2A4781050076E8a3876` (YOUR address)
- **Can Withdraw:** Yes, anytime
- **FeeManager:** `0xab30D0F58442c63C40977045433653A027733961`

## 🏦 HOW TO WITHDRAW YOUR EARNINGS

### Method 1: Using Hardhat Script

```bash
cd base-name-service-fork

# Check balance first
npx hardhat run --network base scripts/check-controller-balance.js

# Withdraw to FeeManager
npx hardhat run --network base scripts/withdraw-funds.js
```

### Method 2: Using Basescan (Easy Way)

1. Go to https://basescan.org/address/0xca7FD90f4C76FbCdbdBB3427804374b16058F55e
2. Click "Contract" → "Write Contract"
3. Connect YOUR wallet (0x5a66231663D22d7eEEe6e2A4781050076E8a3876)
4. Find `withdraw()` function
5. Click "Write" 
6. Approve transaction
7. ETH moves to FeeManager

### Method 3: Direct Smart Contract Call

```javascript
// In your frontend or script
const controller = new ethers.Contract(
  "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e",
  ["function withdraw()"],
  signer
);

await controller.withdraw();
```

## 📊 TRACKING REVENUE

### Check Current Balance in Controller:

```bash
# Quick check
curl -X POST https://mainnet.base.org \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"eth_getBalance","params":["0xca7FD90f4C76FbCdbdBB3427804374b16058F55e","latest"],"id":1}'
```

### Monitor Registrations:

Go to Basescan:
https://basescan.org/address/0xca7FD90f4C76FbCdbdBB3427804374b16058F55e#events

Filter for "NameRegistered" events to see all purchases.

## 🎯 EXAMPLE PURCHASE FLOW

**User "Alice" wants "alice.base":**

1. Alice visits your site
2. Searches "alice" → Available ✅
3. Price shown: 0.003 ETH (~$9)
4. Alice clicks Register
5. MetaMask popup: Pay 0.003 ETH + gas
6. Alice confirms
7. Transaction sent to BaseController
8. BaseController receives 0.003 ETH
9. Domain NFT mints to Alice's wallet
10. **You now have 0.003 ETH in BaseController**

**You withdraw earnings:**

1. Go to Basescan (link above)
2. Connect your wallet
3. Call `withdraw()`
4. 0.003 ETH moves to FeeManager
5. Money is now in FeeManager contract

## ⚠️ IMPORTANT NOTES

### Security:
- ✅ Only YOU can withdraw (you're the owner)
- ✅ Funds are safe in the contract
- ✅ No one else can access them
- ✅ FeeManager provides additional layer of security

### Withdrawal Frequency:
- **Recommended:** Withdraw weekly/monthly
- **Why:** Saves on gas fees
- **Gas Cost:** ~$0.50-$2 per withdrawal

### FeeManager:
The FeeManager is a separate contract that holds your funds. You'll need to:
1. Check what the beneficiary address is in FeeManager
2. That's where funds ultimately go
3. Make sure you control that address

## 🔍 VERIFY OWNERSHIP

Run this to confirm YOU control everything:

```bash
cd base-name-service-fork
npx hardhat run --network base scripts/check-ownership.js
```

Should show:
- Owner: 0x5a66231663D22d7eEEe6e2A4781050076E8a3876 (YOUR address)
- You can withdraw anytime

## 💡 REVENUE ESTIMATES

Based on pricing:
- 3-char domain: $640/year
- 4-char domain: $160/year
- 5+ char domain: $5/year

**If you sell:**
- 100 domains @ $5 avg = $500
- 1000 domains @ $5 avg = $5,000
- 10,000 domains @ $5 avg = $50,000

**Plus renewals every year!**

## 🚀 NEXT STEPS

1. **Test it yourself:** Buy a test domain on your site
2. **Check balance:** See the ETH in BaseController
3. **Withdraw:** Move funds to FeeManager
4. **Verify:** Confirm funds are accessible

Need help? Check the contract on Basescan or run the provided scripts.
