# Commitment Hash Mismatch Fix

## Problem Discovered

The registration was failing with error: `CommitmentNotFound(bytes32)`

### Root Cause Analysis

1. **Step 1 (Commit)** was using the OLD 8-parameter `makeCommitment` signature:
   ```solidity
   makeCommitment(
     string label,
     address owner, 
     uint256 duration,
     bytes32 secret,
     address resolver,
     bytes[] data,
     bool reverseRecord,
     uint16 ownerControlledFuses  // OLD parameter
   )
   ```

2. **Step 2 (Register)** was using the NEW 9-parameter function signature:
   ```solidity
   register(
     string label,
     address owner,
     uint256 duration, 
     bytes32 secret,
     address resolver,
     bytes[] data,
     bool reverseRecord,
     bytes32 referrer,  // NEW parameter
     uint256 fuses      // NEW parameter (replaces ownerControlledFuses)
   )
   ```

3. The `register()` function **internally recalculates** the commitment hash using its 9 parameters
4. This created a **different hash** than what was stored in Step 1
5. Result: `CommitmentNotFound` error

## The Fix

Updated the commitment calculation to use 9 parameters matching the register function:

### Updated Parameters
```typescript
// OLD (8 params - WRONG)
encodeAbiParameters([
  { name: 'label', type: 'string' },
  { name: 'owner', type: 'address' },
  { name: 'duration', type: 'uint256' },
  { name: 'secret', type: 'bytes32' },
  { name: 'resolver', type: 'address' },
  { name: 'data', type: 'bytes[]' },
  { name: 'reverseRecord', type: 'uint256' },
  { name: 'referrer', type: 'bytes32' }
], [...values])

// NEW (9 params - CORRECT)
encodeAbiParameters([
  { name: 'label', type: 'string' },
  { name: 'owner', type: 'address' },
  { name: 'duration', type: 'uint256' },
  { name: 'secret', type: 'bytes32' },
  { name: 'resolver', type: 'address' },
  { name: 'data', type: 'bytes[]' },
  { name: 'reverseRecord', type: 'bool' },      // Changed from uint256
  { name: 'referrer', type: 'bytes32' },
  { name: 'fuses', type: 'uint256' }            // ADDED
], [...values])
```

### Files Changed

1. **src/lib/contracts.ts**
   - Updated `makeCommitment` ABI from 8 to 9 parameters
   - Changed `ownerControlledFuses: uint16` → `referrer: bytes32, fuses: uint256`

2. **src/app/page.tsx**
   - Updated Step 1 commitment calculation to use 9 parameters
   - Updated Step 2 commitment verification to match
   - Fixed reverseRecord type from `uint256` to `bool`

## Verification

The fix was verified using on-chain testing:

```javascript
// Test showed NEW 9-param signature produces the EXPECTED hash
NEW 9-param signature result: 0xe6be8a2078a09981432434cdb92c9844889feb6b6e3b197908b5fcdb32943403
✅ THIS MATCHES what register() expects!
```

## Expected Behavior Now

1. **Step 1**: Calculates commitment with 9 parameters → stores hash in contract
2. **Step 2**: Calculates commitment with SAME 9 parameters → finds matching hash ✅
3. Registration should now succeed!

## Error Discovery Method

1. Analyzed transaction revert data: `0x836588c9e6be8a2078a09981432434cdb92c9844889feb6b6e3b197908b5fcdb32943403`
2. Decoded error selector `0x836588c9` → `CommitmentNotFound(bytes32)`
3. Compared stored commitment vs expected commitment
4. Reverse-engineered both 8-param and 9-param makeCommitment signatures
5. Found that 9-param produces the hash register() expects
