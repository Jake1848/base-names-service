# Free Test Domain Registration

**Want to register domains on mainnet for FREE while testing?** 🎁

This guide shows you how to mint domains without paying gas fees for testing purposes.

---

## Overview

The `TestMinter` contract is a lightweight helper that allows the platform owner to mint domains for free on mainnet. This is perfect for:

- Testing the marketplace without spending ETH
- Creating demo domains for presentations
- Quick prototyping and debugging
- Minting multiple domains in batches

---

## Quick Start (3 Steps)

### Step 1: Deploy TestMinter

```bash
cd base-name-service-fork
npx hardhat run scripts/deploy-test-minter.js --network base
```

**Output:**
```
✅ TestMinter deployed to: 0x...
```

**Save this address!** You'll need it for the next steps.

### Step 2: Authorize TestMinter

The TestMinter needs to be authorized as a "controller" on the BaseRegistrar:

```bash
# Set the TestMinter address from Step 1
export TEST_MINTER_ADDRESS=0x...

# Authorize it as a controller
node scripts/authorize-test-minter.js $TEST_MINTER_ADDRESS
```

**Output:**
```
✅ TestMinter is now a controller: true
```

### Step 3: Mint Your First Domain!

```bash
# Mint a domain for yourself
node scripts/mint-test-domain.js mytest 0xYourAddressHere

# Or use your connected wallet address
node scripts/mint-test-domain.js mytest $(cast wallet address)
```

**Output:**
```
🎉 Success! Domain minted for FREE!
   Domain: mytest.base
   Owner: 0x...
   Expires: December 31, 2026
```

---

## Usage Examples

### Mint a Single Domain

```bash
export TEST_MINTER_ADDRESS=0x...
node scripts/mint-test-domain.js coolname 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
```

### Mint Multiple Domains

Create a simple script or loop:

```bash
export TEST_MINTER_ADDRESS=0x...

# Mint test1.base, test2.base, test3.base
for i in {1..3}; do
  node scripts/mint-test-domain.js "test$i" 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb
  sleep 5  # Wait between transactions
done
```

### Check If Domain Is Available

Use the contract directly:

```javascript
const TestMinter = await ethers.getContractAt("TestMinter", TEST_MINTER_ADDRESS);
const available = await TestMinter.isAvailable("mytest");
console.log("Available:", available);
```

---

## Using with Hardhat Console

For more control, use the Hardhat console:

```bash
cd base-name-service-fork
npx hardhat console --network base
```

Then in the console:

```javascript
const TestMinter = await ethers.getContractAt("TestMinter", "0x...");

// Check availability
await TestMinter.isAvailable("mytest");

// Mint a domain (365 days)
const duration = 365 * 24 * 60 * 60;
await TestMinter.testMint("mytest", "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb", duration);

// Batch mint multiple domains
await TestMinter.testMintBatch(
  ["test1", "test2", "test3"],  // labels
  ["0x...", "0x...", "0x..."],  // owners
  duration                       // 365 days for all
);
```

---

## Contract Functions

### `testMint(string label, address owner, uint256 duration)`

Mints a single domain for free.

**Parameters:**
- `label` - Domain name without `.base` (e.g., "mytest")
- `owner` - Address that will own the domain
- `duration` - Registration period in seconds (minimum 28 days)

**Example:**
```solidity
testMint("coolname", 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb, 365 days);
```

### `testMintBatch(string[] labels, address[] owners, uint256 duration)`

Mints multiple domains in a single transaction.

**Parameters:**
- `labels` - Array of domain names
- `owners` - Array of owner addresses (must match labels length)
- `duration` - Registration period for all domains

**Example:**
```solidity
testMintBatch(
  ["test1", "test2", "test3"],
  [address1, address2, address3],
  365 days
);
```

### `isAvailable(string label)` (view)

Checks if a domain is available for registration.

**Returns:** `bool` - True if available

---

## Testing Marketplace

Once you've minted some test domains, you can:

### 1. List Domain on Marketplace

Go to your dashboard on the frontend and click "List for Sale" on your test domain.

### 2. Buy from Marketplace

Navigate to `/marketplace` and purchase your listed domain to test the buy flow.

### 3. Cancel Listing

Use the "Cancel Listing" button to test cancellation.

---

## Environment Variables

Make sure to set these in your `.env` file:

```bash
# Your private key (must be registrar owner)
PRIVATE_KEY=0x...

# RPC endpoint
BASE_MAINNET_RPC=https://mainnet.base.org

# TestMinter address (after deployment)
TEST_MINTER_ADDRESS=0x...
```

---

## Security Notes

⚠️ **IMPORTANT:**

1. **Owner Only** - Only the TestMinter owner can mint domains
2. **Must Be Controller** - TestMinter must be authorized on BaseRegistrar
3. **No Payment Required** - Completely free minting (just gas costs)
4. **Mainnet Use** - Safe to use on mainnet for testing
5. **Revoke When Done** - Remove TestMinter as controller when done testing:

```javascript
const BaseRegistrar = await ethers.getContractAt("BaseRegistrarImplementation", "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca");
await BaseRegistrar.removeController(TEST_MINTER_ADDRESS);
```

---

## Troubleshooting

### "Domain not available"

The domain might already be registered. Try a different name or check on BaseScan.

### "You are not the owner of the registrar"

Make sure you're using the correct private key in your `.env` file. The owner of BaseRegistrar must authorize TestMinter.

### "TEST_MINTER_ADDRESS not set"

Run: `export TEST_MINTER_ADDRESS=0x...` with your deployed TestMinter address.

### "Transaction reverted"

- Check you have enough ETH for gas
- Verify TestMinter is authorized as a controller
- Ensure domain label is valid (3+ chars, lowercase, no spaces)

---

## Deployed Addresses

**Base Mainnet:**

- BaseRegistrar: `0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca`
- TestMinter: _(deploy and save your address)_

---

## Next Steps

After minting test domains:

1. ✅ Test listing on marketplace
2. ✅ Test buying flow
3. ✅ Test canceling listings
4. ✅ Test domain resolution
5. ✅ Test subdomain creation
6. ✅ Prepare for Coinbase pitch!

---

## Need Help?

Check the full audit report: `SECURITY_AUDIT_REPORT.md`

Happy testing! 🚀
