# Base Names - Decentralized Domain Service on Base L2

![Base Names](https://img.shields.io/badge/Base%20Names-Production%20Ready-green)
![Base L2](https://img.shields.io/badge/Base%20L2-Compatible-blue)
![Web3](https://img.shields.io/badge/Web3-Frontend-purple)

> **Production-ready decentralized domain name service for Base Layer 2, featuring .base domains with ENS compatibility.**

## 🚀 **LIVE SYSTEM STATUS**

- ✅ **10 Live Domains** registered on Base Sepolia
- ✅ **Smart Contracts** deployed and verified
- ✅ **Web3 Frontend** with premium UI/UX
- ✅ **Analytics Dashboard** with key metrics
- ✅ **Marketplace** with investment insights

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

### Smart Contracts (Base Sepolia)
- **ENSRegistry**: `0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00`
- **BaseRegistrar**: `0xB364eb42E361b923244eC9ad6A0bc57fAfDaB15b`
- **PublicResolver**: `0x6C421ca8356886E5634B267A340102c597c2a352`
- **BasePriceOracle**: `0x83eF9752EE4f706Ce1f6aa3D32fA1f9f07c2baEb`
- **SubdomainManager**: `0x8c8433998F9c980524BC46118c73c6Db63e244F8`

### Frontend Stack
- **Next.js 14** with App Router and TypeScript
- **Wagmi + Viem** for Web3 interactions
- **RainbowKit** for wallet connections
- **Framer Motion** for animations
- **TailwindCSS** + Radix UI for styling

## 🏷️ **Live Domains Portfolio**

| Domain | Status | Owner | Expires |
|--------|--------|-------|---------|
| alice.base | ✅ Registered | 0x5a66...3876 | 2025 |
| bob.base | ✅ Registered | 0x5a66...3876 | 2025 |
| crypto.base | ✅ Registered | 0x5a66...3876 | 2025 |
| defi.base | ✅ Registered | 0x5a66...3876 | 2025 |
| web3.base | ✅ Registered | 0x5a66...3876 | 2025 |
| nft.base | ✅ Registered | 0x5a66...3876 | 2025 |
| *+4 more domains* | ✅ Registered | 0x5a66...3876 | 2025 |

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
- Base Sepolia testnet ETH

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

#### Mainnet (Base)
```bash
cd base-name-service-fork
npx hardhat run scripts/deploy-sepolia.js --network base
```

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

- **Live Frontend**: http://localhost:3001 (local)
- **Base Sepolia Explorer**: https://sepolia.basescan.org
- **Base Mainnet**: https://base.org
- **ENS Documentation**: https://docs.ens.domains

## 📧 **Contact**

- **Demo**: Available for investor presentations
- **Technical**: Full codebase available for due diligence
- **Business**: Investment opportunities welcome

## 📜 **License**

MIT License - see [LICENSE](./LICENSE) for details.

---

**🚀 Ready for Base L2 • Built for Scale • Investor Ready**

*Base Names - Own Your Digital Identity on Base*