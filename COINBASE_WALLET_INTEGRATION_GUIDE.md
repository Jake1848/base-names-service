# Coinbase Wallet Integration Guide - Base Names (.base domains)

**To:** Coinbase Wallet Engineering Team
**From:** Base Names Service
**Date:** October 16, 2025
**Purpose:** Enable native .base domain resolution in Coinbase Wallet

---

## Executive Summary

This guide provides everything Coinbase Wallet needs to add native .base domain support, allowing users to send ETH to human-readable addresses like "alice.base" instead of "0x742d35Cc6...".

**Benefit to Coinbase Wallet:** Dramatically improved UX for Base users, competitive advantage over MetaMask, natural integration with Base L2 ecosystem.

**Implementation Time:** 2-4 hours for basic integration, 1 day for full feature set.

---

## What Users Will Experience

### Before Integration:
```
User types: alice.base
Result: ❌ "Invalid address"
```

### After Integration:
```
User types: alice.base
Wallet resolves to: 0x742d35Cc6634C21cF196a9A6ABdD13f8075A88a7
User confirms and sends
Result: ✅ Transaction successful
```

---

## Technical Implementation

### 1. Contract Addresses (Base Mainnet)

```typescript
const BASE_NAMES_CONTRACTS = {
  // ENS Registry - resolves domain → resolver address
  ENSRegistry: '0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E',

  // Public Resolver - resolves domain → ETH address
  PublicResolver: '0x...', // TODO: Add your resolver address

  // Base Registrar - domain ownership
  BaseRegistrar: '0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca',
};
```

### 2. Core Resolution Flow

```typescript
import { createPublicClient, http, type Address } from 'viem';
import { base } from 'viem/chains';
import { namehash } from 'viem/ens';

// Initialize Base client
const baseClient = createPublicClient({
  chain: base,
  transport: http('https://mainnet.base.org'),
});

// ENS Registry ABI (minimal)
const ENS_REGISTRY_ABI = [
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

// Public Resolver ABI (minimal)
const PUBLIC_RESOLVER_ABI = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

/**
 * Resolve .base domain to Ethereum address
 */
async function resolveBaseDomain(domain: string): Promise<Address | null> {
  try {
    // 1. Ensure domain ends with .base
    if (!domain.endsWith('.base')) {
      domain = domain + '.base';
    }

    // 2. Calculate namehash
    const node = namehash(domain);

    // 3. Get resolver address from registry
    const resolverAddress = await baseClient.readContract({
      address: BASE_NAMES_CONTRACTS.ENSRegistry as Address,
      abi: ENS_REGISTRY_ABI,
      functionName: 'resolver',
      args: [node],
    });

    if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
      return null; // Domain not found
    }

    // 4. Get ETH address from resolver
    const ethAddress = await baseClient.readContract({
      address: resolverAddress,
      abi: PUBLIC_RESOLVER_ABI,
      functionName: 'addr',
      args: [node],
    });

    if (!ethAddress || ethAddress === '0x0000000000000000000000000000000000000000') {
      return null; // Address not set
    }

    return ethAddress as Address;

  } catch (error) {
    console.error('Base domain resolution error:', error);
    return null;
  }
}
```

---

## Integration Points

### A. Address Input Field

**When:** User types in "Send To" field
**Action:** Check if input ends with `.base` and resolve

```typescript
// In your address input handler
function handleAddressInput(input: string) {
  const cleanInput = input.trim().toLowerCase();

  // Check if it's a .base domain
  if (cleanInput.endsWith('.base') || !cleanInput.startsWith('0x')) {
    // Resolve domain
    resolveBaseDomain(cleanInput).then((address) => {
      if (address) {
        setResolvedAddress(address);
        setDisplayName(cleanInput); // Show domain name in UI
        // Proceed with transaction to resolved address
      } else {
        showError('Domain not found or not configured');
      }
    });
  } else {
    // Regular hex address
    validateAndSetAddress(cleanInput);
  }
}
```

### B. Transaction Confirmation Screen

Show both domain and resolved address:

```
Send 0.1 ETH to:

alice.base
↓
0x742d35Cc6634C21cF196a9A6ABdD13f8075A88a7

[Confirm] [Cancel]
```

### C. Transaction History

Store and display domain names:

```typescript
interface Transaction {
  to: Address;
  toDomain?: string; // 'alice.base'
  amount: string;
  // ... other fields
}
```

---

## SDK Integration (Easiest Option)

We've built a ready-to-use SDK:

```bash
npm install @base-names/resolver
```

```typescript
import { DomainResolver } from '@base-names/resolver';

const resolver = new DomainResolver();

// Simple resolution
const address = await resolver.resolve('alice.base');

// With profile data (avatar, twitter, etc.)
const profile = await resolver.resolveWithProfile('alice.base');
```

**Benefits:**
- ✅ Handles all edge cases
- ✅ Includes caching
- ✅ Error handling built-in
- ✅ TypeScript support
- ✅ 2 KB gzipped

---

## Error Handling

```typescript
enum DomainResolutionError {
  NOT_FOUND = 'Domain not registered',
  NOT_CONFIGURED = 'Domain has no address set',
  INVALID_FORMAT = 'Invalid domain format',
  NETWORK_ERROR = 'Unable to connect to Base network',
}

function handleResolutionError(error: DomainResolutionError) {
  // Show user-friendly error message
  toast.error({
    title: 'Domain Resolution Failed',
    description: error,
    action: 'Try Again',
  });
}
```

---

## UX Recommendations

### 1. Auto-completion
```
User types: "alic"
Suggest:
  - alice.base (if registered)
  - alicia.base
  - aliceinchains.base
```

### 2. Address Book Integration
```
Contacts:
  Alice → alice.base → 0x742d35...
  Bob → bob.base → 0x8a91f2...
```

### 3. Domain Badges
Show verified badge for domains with complete profiles

### 4. Quick Resolution Indicator
```
alice.base ✓ (resolves to 0x742d35...)
```

---

## Testing

### Testnet Domains (Base Sepolia)

Use these for testing:

```
test1.base → 0x...
test2.base → 0x...
test3.base → 0x...
```

### Test Cases

1. **Valid Domain**: `alice.base` → Should resolve
2. **Unregistered**: `nonexistent123.base` → Should show error
3. **No Address Set**: `unconfigured.base` → Should show error
4. **Malformed**: `alice..base` → Should show error
5. **Network Error**: Offline → Should show network error

---

## Performance Considerations

### Caching Strategy

```typescript
// Cache resolved domains for 5 minutes
const domainCache = new Map<string, { address: Address; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function resolveDomainWithCache(domain: string): Promise<Address | null> {
  const cached = domainCache.get(domain);

  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.address;
  }

  const address = await resolveBaseDomain(domain);

  if (address) {
    domainCache.set(domain, { address, timestamp: Date.now() });
  }

  return address;
}
```

### Batch Resolution

For transaction history with multiple domains:

```typescript
async function resolveMultipleDomains(domains: string[]): Promise<Map<string, Address>> {
  // Batch contract calls using multicall
  const results = await baseClient.multicall({
    contracts: domains.map(domain => ({
      address: BASE_NAMES_CONTRACTS.ENSRegistry,
      abi: ENS_REGISTRY_ABI,
      functionName: 'resolver',
      args: [namehash(domain)],
    })),
  });

  // Process results...
}
```

---

## Security Considerations

### 1. Display Both Domain AND Address
Always show the resolved address to prevent phishing:

```
Sending to:
alice.base
↓
0x742d35Cc6634C21cF196a9A6ABdD13f8075A88a7
```

### 2. Verify Resolution Before Signing
Re-resolve domain immediately before transaction signing (don't trust old cache).

### 3. Warn on First Use
```
⚠️ You're sending to a .base domain
Domain: alice.base
Resolves to: 0x742d35...

This will send to the address currently set for this domain.
Domain owners can change their address.

☑ I understand
```

### 4. Phishing Protection
Check for similar domains:
```
Warning: "alicε.base" looks similar to "alice.base"
Be sure you're sending to the right domain.
```

---

## Analytics to Track

Once integrated, track:

1. **Resolution Success Rate**: % of successful resolutions
2. **Usage**: # of transactions using .base domains
3. **Popular Domains**: Most-used domains
4. **Error Types**: What errors users encounter
5. **Performance**: Average resolution time

---

## Support & Questions

**Technical Questions:**
- Email: dev@basenamesservice.xyz
- Discord: [Your Discord]
- GitHub: [Your GitHub]

**Integration Support:**
- We can pair program the integration
- Available for code reviews
- Can provide testnet tokens for testing

---

## Competitive Advantage

### Why Add This:

1. **First Mover**: Be the first wallet with native .base support
2. **Base Differentiation**: Natural fit with Base L2
3. **User Delight**: Dramatically better UX
4. **Network Effects**: More users → more domains → more value
5. **Coinbase Ecosystem**: Strengthens entire Coinbase/Base ecosystem

### Marketing Angle:

```
"Coinbase Wallet: The only wallet where you can
send ETH to alice.base instead of 0x742d35Cc6..."
```

---

## Rollout Plan

### Phase 1: Basic Integration (Week 1)
- ✅ Resolve .base domains in send flow
- ✅ Display both domain and address
- ✅ Basic error handling

### Phase 2: Enhanced UX (Week 2-3)
- ✅ Auto-completion suggestions
- ✅ Address book integration
- ✅ Transaction history with domains
- ✅ Caching for performance

### Phase 3: Advanced Features (Month 2)
- ✅ Profile data (avatar, social links)
- ✅ Reverse resolution (address → domain)
- ✅ Multi-chain support (when available)

---

## API Reference

Full API documentation available at:
**docs.basenamesservice.xyz/wallet-integration**

Quick reference:

```typescript
// Resolve domain
await resolver.resolve('alice.base');
// Returns: Address | null

// Resolve with profile
await resolver.resolveWithProfile('alice.base');
// Returns: { name, address, avatar, twitter, ... }

// Check availability
await resolver.isAvailable('newdomain.base');
// Returns: boolean

// Reverse resolution
await resolver.reverse('0x742d35...');
// Returns: string | null
```

---

## Next Steps

1. **Schedule Integration Call**: Let's pair on the implementation
2. **Testnet Access**: We'll provide testnet domains for testing
3. **Beta Testing**: Test with internal Coinbase users first
4. **Launch**: Coordinate announcement for maximum impact

**Contact:**
- Email: partnerships@basenamesservice.xyz
- Calendar: [Schedule 30-min call]

---

## Appendix: Complete Code Example

See `/examples/coinbase-wallet-integration.ts` for a complete, production-ready implementation.

---

**Let's make Coinbase Wallet the best way to use .base domains! 🚀**
