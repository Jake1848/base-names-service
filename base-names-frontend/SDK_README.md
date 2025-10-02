# Base Names Service SDK

Official TypeScript SDK for integrating .base domain functionality into your application.

## Installation

```bash
npm install @base-names/sdk
# or
yarn add @base-names/sdk
# or
pnpm add @base-names/sdk
```

## Quick Start

```typescript
import { BaseNamesSDK } from '@base-names/sdk';

// Initialize the SDK
const sdk = new BaseNamesSDK({
  chainId: 8453, // Base Mainnet (use 84532 for Base Sepolia testnet)
  provider: window.ethereum // Optional: For write operations
});

// Check if a domain is available
const isAvailable = await sdk.domains.isAvailable('myname');

if (isAvailable) {
  // Get the price to register for 1 year
  const price = await sdk.domains.getPrice('myname', 365);
  console.log(`Price: ${sdk.formatEth(price.total)} ETH`);

  // Register the domain
  const txHash = await sdk.domains.register('myname', {
    duration: 365, // days
    owner: '0xYourAddress...'
  });

  console.log(`Registration transaction: ${txHash}`);
}
```

## API Reference

### Configuration

```typescript
interface SDKConfig {
  chainId: number;        // 8453 (Base Mainnet) or 84532 (Base Sepolia)
  provider?: any;         // EIP-1193 provider (e.g., window.ethereum)
  rpcUrl?: string;        // Optional: Custom RPC URL
}
```

### Domain Operations

#### Check Availability

```typescript
const isAvailable: boolean = await sdk.domains.isAvailable('myname');
```

#### Get Domain Information

```typescript
const info = await sdk.domains.getInfo('myname');

console.log(info.name);       // 'myname'
console.log(info.available);  // true/false
console.log(info.owner);      // Owner address
console.log(info.expires);    // Expiry timestamp
console.log(info.tokenId);    // NFT token ID
```

#### Get Registration Price

```typescript
const price = await sdk.domains.getPrice('myname', 365); // 365 days

console.log(sdk.formatEth(price.base));     // Base price
console.log(sdk.formatEth(price.premium));  // Premium (if any)
console.log(sdk.formatEth(price.total));    // Total price
```

#### Register a Domain

```typescript
const txHash = await sdk.domains.register('myname', {
  duration: 365,                    // Registration period in days
  owner: '0xYourAddress...',        // Owner address
  resolver: '0xResolverAddress',    // Optional: Custom resolver
  reverseRecord: true               // Optional: Set reverse record
});

console.log(`Transaction hash: ${txHash}`);
```

### Marketplace Operations

#### Get Listing Information

```typescript
const tokenId = sdk.nameToTokenId('myname');
const listing = await sdk.marketplace.getListing(tokenId);

if (listing && listing.active) {
  console.log(`Price: ${sdk.formatEth(listing.price)} ETH`);
  console.log(`Seller: ${listing.seller}`);
}
```

#### Create a Listing

```typescript
const tokenId = sdk.nameToTokenId('myname');
const price = sdk.parseEth('1.5'); // 1.5 ETH

const txHash = await sdk.marketplace.createListing(tokenId, price);
```

#### Buy a Listed Domain

```typescript
const tokenId = sdk.nameToTokenId('myname');
const txHash = await sdk.marketplace.buyListing(tokenId);
```

### Auction Operations

#### Get Auction Information

```typescript
const tokenId = sdk.nameToTokenId('myname');
const auction = await sdk.auctions.getAuction(tokenId);

if (auction && auction.active) {
  console.log(`Current bid: ${sdk.formatEth(auction.currentBid)} ETH`);
  console.log(`Highest bidder: ${auction.highestBidder}`);
  console.log(`Ends at: ${new Date(Number(auction.endTime) * 1000)}`);
}
```

#### Create an Auction

```typescript
const tokenId = sdk.nameToTokenId('myname');
const startPrice = sdk.parseEth('0.5'); // 0.5 ETH
const durationInHours = 24;

const txHash = await sdk.auctions.createAuction(tokenId, startPrice, durationInHours);
```

#### Place a Bid

```typescript
const tokenId = sdk.nameToTokenId('myname');
const bidAmount = sdk.parseEth('0.6'); // 0.6 ETH

const txHash = await sdk.auctions.placeBid(tokenId, bidAmount);
```

## React Integration

### Using the Hook

```typescript
import { useBaseNames } from '@base-names/sdk';

function MyComponent() {
  const sdk = useBaseNames({
    chainId: 8453,
    provider: window.ethereum
  });

  const [isAvailable, setIsAvailable] = useState(false);

  useEffect(() => {
    async function checkAvailability() {
      const available = await sdk.domains.isAvailable('myname');
      setIsAvailable(available);
    }
    checkAvailability();
  }, []);

  return (
    <div>
      {isAvailable ? 'Available!' : 'Taken'}
    </div>
  );
}
```

### Complete Example Component

```typescript
import { useState } from 'react';
import { BaseNamesSDK } from '@base-names/sdk';
import { useAccount } from 'wagmi';

function DomainRegistration() {
  const { address } = useAccount();
  const [domainName, setDomainName] = useState('');
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [price, setPrice] = useState<string>('');

  const sdk = new BaseNamesSDK({
    chainId: 8453,
    provider: window.ethereum
  });

  const checkAvailability = async () => {
    if (!domainName) return;

    const available = await sdk.domains.isAvailable(domainName);
    setIsAvailable(available);

    if (available) {
      const priceData = await sdk.domains.getPrice(domainName, 365);
      setPrice(sdk.formatEth(priceData.total));
    }
  };

  const register = async () => {
    if (!address || !isAvailable) return;

    try {
      const txHash = await sdk.domains.register(domainName, {
        duration: 365,
        owner: address
      });

      console.log('Registration successful:', txHash);
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={domainName}
        onChange={(e) => setDomainName(e.target.value)}
        placeholder="Enter domain name"
      />
      <button onClick={checkAvailability}>Check Availability</button>

      {isAvailable !== null && (
        <div>
          {isAvailable ? (
            <div>
              <p>✅ Available!</p>
              <p>Price: {price} ETH</p>
              <button onClick={register}>Register</button>
            </div>
          ) : (
            <p>❌ Not available</p>
          )}
        </div>
      )}
    </div>
  );
}
```

## Advanced Usage

### Custom RPC URL

```typescript
const sdk = new BaseNamesSDK({
  chainId: 8453,
  rpcUrl: 'https://your-custom-base-rpc.com'
});
```

### Error Handling

```typescript
try {
  const txHash = await sdk.domains.register('myname', {
    duration: 365,
    owner: address
  });
  console.log('Success:', txHash);
} catch (error) {
  if (error.message.includes('insufficient funds')) {
    console.error('Not enough ETH for registration');
  } else if (error.message.includes('user rejected')) {
    console.error('User rejected transaction');
  } else {
    console.error('Registration failed:', error);
  }
}
```

### Batch Operations

```typescript
// Check multiple domains at once
const domains = ['alice', 'bob', 'charlie'];
const results = await Promise.all(
  domains.map(name => sdk.domains.isAvailable(name))
);

domains.forEach((name, i) => {
  console.log(`${name}: ${results[i] ? 'Available' : 'Taken'}`);
});
```

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  DomainInfo,
  RegistrationOptions,
  ListingInfo,
  AuctionInfo
} from '@base-names/sdk';

const info: DomainInfo = await sdk.domains.getInfo('myname');
```

## Network Support

- **Base Mainnet** (chainId: 8453)
- **Base Sepolia Testnet** (chainId: 84532)

## Contract Addresses

### Base Mainnet (8453)
- Registrar: `0xD158de26c787ABD1E0f2955C442fea9d4DC0a917`
- Controller: `0xca7FD90f4C76FbCdbdBB3427804374b16058F55e`
- Resolver: `0x5D5bC53bDa5105561371FEf50B50E03aA94c962E`

## Best Practices

1. **Always check availability before registering**
   ```typescript
   const available = await sdk.domains.isAvailable('myname');
   if (!available) return;
   ```

2. **Get price before registration**
   ```typescript
   const price = await sdk.domains.getPrice('myname', 365);
   // Show price to user for confirmation
   ```

3. **Handle transaction errors gracefully**
   ```typescript
   try {
     await sdk.domains.register(...);
   } catch (error) {
     // Show user-friendly error message
   }
   ```

4. **Use environment-specific chain IDs**
   ```typescript
   const chainId = process.env.NODE_ENV === 'production' ? 8453 : 84532;
   ```

## Support

- Documentation: https://docs.basenameservice.xyz
- GitHub: https://github.com/Jake1848/base-names-service
- Discord: https://discord.gg/basenameservice

## License

MIT
