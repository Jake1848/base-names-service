# Base Names - Decentralized Domain Service

![Base Names](https://img.shields.io/badge/Base%20Names-LIVE%20ON%20MAINNET-brightgreen)
![Base L2](https://img.shields.io/badge/Base%20Mainnet-DEPLOYED-blue)
![Web3](https://img.shields.io/badge/Production-Ready-purple)

> **🌐 LIVE at [basenameservice.xyz](https://basenameservice.xyz) - Register your .base domain now!**

## 🔥 **PRODUCTION STATUS**

- 🚀 **LIVE ON BASE MAINNET** - All smart contracts operational
- 🌐 **basenameservice.xyz** - Production website live
- ✅ **Real .base domains** available for registration (0.05 ETH/year)
- 🎨 **Enhanced UI** with Coinbase Blue theme & dark mode
- 🥇 **First-to-market** .base TLD on Base Layer 2
- ⚡ **Lightning fast** registrations on Base L2

## 🌐 **Quick Start**

### Frontend (Next.js 14)
```bash
cd base-names-frontend
npm install
npm run dev
# Visit http://localhost:3001
```

### Smart Contracts (Hardhat)
```bash
cd base-name-service-fork
npm install
npx hardhat test
npx hardhat run scripts/deploy-sepolia.js --network base-sepolia
```

## 📋 **Project Structure**

```
base-names/
├── base-name-service-fork/     # Smart contracts (Hardhat)
│   ├── contracts/              # Solidity contracts
│   ├── scripts/               # Deployment scripts
│   ├── test/                  # Contract tests
│   └── deployment-base-sepolia.json
├── base-names-frontend/       # Web3 frontend (Next.js 14)
│   ├── src/app/              # App router pages
│   ├── src/components/       # Reusable components
│   ├── src/lib/              # Utilities and configs
│   └── src/hooks/            # Custom React hooks
├── docs/                     # Documentation
├── BASE_NAMES_DOCUMENTATION.md
└── PROJECT_COMPLETE_SUMMARY.md
```

## 🏗️ **Architecture**

### Smart Contracts (Base Mainnet) 🔥
- **ENSRegistry**: `0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E`
- **BaseRegistrar**: `0xD158de26c787ABD1E0f2955C442fea9d4DC0a917`
- **BaseController**: `0xca7FD90f4C76FbCdbdBB3427804374b16058F55e`
- **PublicResolver**: `0x5D5bC53bDa5105561371FEf50B50E03aA94c962E`
- **BasePriceOracle**: `0xA1805458A1C1294D53eBBBd025B397F89Dd963AC`

*All contracts verified and operational on Base Mainnet (Chain ID: 8453)*

### Frontend Stack
- **Next.js 14** with App Router and TypeScript
- **Wagmi + Viem** for Web3 interactions
- **RainbowKit** for wallet connections
- **Enhanced UI** with Coinbase Blue theme
- **Dark/Light mode** toggle with next-themes
- **Framer Motion** animations and effects
- **TailwindCSS** + Radix UI + ShadCN styling

## 🌟 **How to Register Your .base Domain**

### Step 1: Visit [basenameservice.xyz](https://basenameservice.xyz)
### Step 2: Connect your Web3 wallet
### Step 3: Search for available domains
### Step 4: Register for 0.05 ETH per year

**Premium domains available**: eth.base, coinbase.base, base.base, web3.base, nft.base, defi.base, crypto.base

## 🎯 **Key Features**

### Domain Registration
- Real-time availability checking
- One-click registration with MetaMask
- Automatic ENS compatibility
- Subdomain creation support

### Analytics Dashboard
- Registration metrics and trends
- Revenue tracking and projections
- User growth analytics
- Market performance insights

### Marketplace (Coming Soon)
- Domain trading and auctions
- Premium domain listings
- Investment opportunity tracking
- Market statistics and trends

## 💰 **Business Model**

- **Registration Fee**: 0.05 ETH/year per domain
- **Premium Domains**: Market-based pricing
- **Subdomain Services**: Enterprise features
- **Marketplace Commission**: 2.5% on secondary sales

## 🔧 **Development**

### Prerequisites
- Node.js 18+
- MetaMask or compatible Web3 wallet
- ETH on Base mainnet for registration

### Environment Setup
```bash
# Smart contracts
cd base-name-service-fork
cp .env.example .env
# Add your PRIVATE_KEY and BASESCAN_API_KEY

# Frontend
cd base-names-frontend
cp .env.example .env.local
# Add your NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID
```

### Testing
```bash
# Smart contract tests
cd base-name-service-fork
npx hardhat test

# Frontend tests
cd base-names-frontend
npm run test
```

### Deployment

#### Testnet (Base Sepolia)
```bash
cd base-name-service-fork
npx hardhat run scripts/deploy-sepolia.js --network base-sepolia
```

#### Mainnet (Base) - DEPLOYED ✅
```bash
cd base-name-service-fork
npx hardhat run scripts/deploy-base-ens.js --network base
```
*Contracts already deployed and operational on Base mainnet*

## 🛡️ **Security**

- **Smart Contract Audits**: Recommended before mainnet
- **OpenZeppelin**: Standard security libraries used
- **ReentrancyGuard**: Protection against reentrancy attacks
- **Access Control**: Role-based permissions
- **Emergency Pause**: Circuit breaker functionality

## 📊 **Investment Metrics**

- **Total Addressable Market**: $3.8B domain industry
- **Base L2 Growth**: 10x user growth in 2024
- **Revenue Projection**: $10M ARR by Year 3
- **Competitive Advantage**: First .base TLD on Base L2

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 **Documentation**

- [Complete Technical Documentation](./BASE_NAMES_DOCUMENTATION.md)
- [Project Summary](./PROJECT_COMPLETE_SUMMARY.md)
- [Security Audit Guidelines](./SECURITY.md)
- [API Documentation](./docs/)

## 🔗 **Links**

- **🌐 LIVE WEBSITE**: https://basenameservice.xyz
- **📊 BaseScan (Mainnet)**: https://basescan.org
- **⛓️ Base Network**: https://base.org
- **📖 ENS Documentation**: https://docs.ens.domains
- **💰 Register Domain**: https://basenameservice.xyz

## 📧 **Contact**

- **Demo**: Available for investor presentations
- **Technical**: Full codebase available for due diligence
- **Business**: Investment opportunities welcome

## 📜 **License**

MIT License - see [LICENSE](./LICENSE) for details.

---

**🚀 LIVE on Base Mainnet • First .base TLD • Register Now at basenameservice.xyz**

*Base Names - Own Your Digital Identity on Base Layer 2*
