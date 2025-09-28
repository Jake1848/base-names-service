# Base Name Service - Web3 Frontend Plan

## Overview
Create a modern web3 frontend for registering and managing .base domains on Base L2.

## Tech Stack
- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Web3**: Viem + Wagmi + RainbowKit
- **UI**: Radix UI components + Framer Motion
- **State**: Zustand for client state

## Core Features

### 1. Domain Search & Registration
- [ ] Search bar for .base domains
- [ ] Real-time availability checking
- [ ] Domain suggestions if unavailable
- [ ] Price display (based on length/premium)
- [ ] Registration flow with MetaMask

### 2. Domain Management Dashboard
- [ ] List user's registered domains
- [ ] Domain expiration tracking
- [ ] Renewal functionality
- [ ] Transfer domains
- [ ] Set/update records (A, AAAA, TXT, etc.)

### 3. Resolver Integration
- [ ] Set ETH address for domain
- [ ] Set content hash (IPFS/Swarm)
- [ ] Social profiles (Twitter, GitHub, etc.)
- [ ] Avatar/profile picture

### 4. Network Support
- [ ] Base Mainnet integration
- [ ] Base Sepolia testnet for testing
- [ ] Automatic network switching
- [ ] Gas estimation

## File Structure
```
frontend/
├── app/
│   ├── page.tsx              # Home/search page
│   ├── domain/[name]/         # Domain details page
│   ├── dashboard/             # User dashboard
│   └── layout.tsx             # Root layout
├── components/
│   ├── ui/                    # Reusable UI components
│   ├── domain/                # Domain-specific components
│   └── web3/                  # Web3 connection components
├── hooks/
│   ├── useENS.ts             # ENS contract interactions
│   ├── useDomainSearch.ts    # Search functionality
│   └── useRegistration.ts    # Registration flow
├── lib/
│   ├── contracts.ts          # Contract addresses/ABIs
│   ├── utils.ts              # Helper functions
│   └── web3.ts               # Web3 configuration
└── public/
    └── assets/               # Images, icons, etc.
```

## Key Components

### 1. DomainSearchForm
```typescript
interface DomainSearchProps {
  onSearch: (domain: string) => void;
  isLoading: boolean;
}
```

### 2. RegistrationFlow
```typescript
interface RegistrationFlowProps {
  domain: string;
  price: bigint;
  onComplete: (txHash: string) => void;
}
```

### 3. DomainCard
```typescript
interface DomainCardProps {
  domain: {
    name: string;
    expires: Date;
    owner: Address;
    records: Record<string, string>;
  };
}
```

## Smart Contract Integration

### Contract Addresses (Base Sepolia)
- ENSRegistry: `0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00`
- BaseRegistrar: `0xB364eb42E361b923244eC9ad6A0bc57fAfDaB15b`
- PublicResolver: `0x6C421ca8356886E5634B267A340102c597c2a352`
- BasePriceOracle: `0x83eF9752EE4f706Ce1f6aa3D32fA1f9f07c2baEb`

### Key Contract Methods
```typescript
// Check domain availability
const available = await registrar.read.available([labelHash]);

// Get domain price
const price = await priceOracle.read.price([name, expires, duration]);

// Register domain
const hash = await registrar.write.register([
  labelHash,
  owner,
  duration
]);

// Set resolver records
await resolver.write.setAddr([node, address]);
await resolver.write.setText([node, key, value]);
```

## Deployment Options

### Option 1: Vercel (Recommended)
- Easy Next.js deployment
- Built-in analytics
- Edge functions for API routes

### Option 2: IPFS + ENS
- Decentralized hosting
- Set content hash in resolver
- Access via .base domain

### Option 3: Traditional hosting
- Netlify, Railway, etc.
- Standard web deployment

## Getting Started

1. **Create Next.js App**
   ```bash
   npx create-next-app@latest base-names-frontend
   cd base-names-frontend
   ```

2. **Install Dependencies**
   ```bash
   npm install viem wagmi @rainbow-me/rainbowkit
   npm install @radix-ui/react-* framer-motion
   npm install zustand clsx tailwind-merge
   ```

3. **Configure Web3**
   - Set up Wagmi config for Base network
   - Configure RainbowKit wallet connection
   - Add contract ABIs and addresses

4. **Build Core Features**
   - Start with domain search
   - Add registration flow
   - Implement dashboard

## Security Considerations
- Validate all user inputs
- Handle failed transactions gracefully
- Display clear gas estimates
- Implement proper error boundaries
- Use TypeScript for type safety

## Future Enhancements
- Subdomain support
- Bulk registration
- Domain marketplace
- Analytics dashboard
- Mobile app (React Native)