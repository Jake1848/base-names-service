# Base Names V2 Deployment Status

## ✅ BOTH NETWORKS FULLY DEPLOYED AND READY

---

## 🧪 Base Sepolia (Testnet)

### Core Contracts
- **ENS Registry**: `0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00`
- **BaseRegistrarV2**: `0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6` ✅
- **ETHRegistrarControllerV2**: `0x9A2cf9387d74bBa208406DC98Ba3EEE3449a17ed` ✅
- **Metadata Contract**: `0xDb770A373c99DAcE31B8f0e456e9D97CbAed057b` ✅

### Helper Contracts
- **Price Oracle**: `0x83eF9752EE4f706Ce1f6aa3D32fA1f9f07c2baEb`
- **Registration Limiter**: `0x823262c6F3283Ac4901f704769aAD39FE6888c27`
- **Fee Manager**: `0x7b84068C4eF344bA11eF3F9D322305618Df57bBA`
- **Public Resolver**: `0x2927556a0761d6E4A6635CBE9988747625dAe125`
- **Reverse Registrar**: `0xC97018De65cDD20c6e9d264316139efA747b2E7A`

### Status
- ✅ Registrar deployed with correct baseNode (0x7e7650...)
- ✅ Controller authorized on registrar
- ✅ .base node owned by registrar
- ✅ Metadata contract configured
- ✅ Helper contracts properly configured
- ✅ Frontend updated

---

## 🌐 Base Mainnet

### Core Contracts
- **ENS Registry**: `0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E`
- **BaseRegistrarV2**: `0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca` ✅
- **ETHRegistrarControllerV2**: `0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8` ✅
- **Metadata Contract**: `0xc30A22d048E1F9fe878b779D26c328eBAa7Bb797` ✅

### Helper Contracts
- **Price Oracle**: `0xA1805458A1C1294D53eBBBd025B397F89Dd963AC`
- **Registration Limiter**: `0x1376A3C0403cabeE7Da7D2BaC6266F94D1BBB64B`
- **Fee Manager**: `0xab30D0F58442c63C40977045433653A027733961`
- **Public Resolver**: `0x5D5bC53bDa5105561371FEf50B50E03aA94c962E`
- **Reverse Registrar**: `0xD982f3bFf21dCb9421ffBC2000Cfe3C94A01c889`
- **Default Reverse Registrar**: `0x48325DC9aF4b6F04269A5370C94138074449Fd9f`

### Status
- ✅ Registrar deployed with correct baseNode (0x7e7650...)
- ✅ Controller authorized on registrar
- ✅ .base node owned by registrar
- ✅ Metadata contract configured
- ✅ Helper contracts properly configured
- ✅ Frontend updated

---

## 🎨 NFT Metadata Features

All registered domains will automatically have:
- ✅ On-chain SVG generation with beautiful blue gradient
- ✅ name() function returning "Base Names"
- ✅ symbol() function returning "BASE"
- ✅ tokenURI() with full JSON metadata
- ✅ Rich attributes: domain, length, rarity, expiration, status
- ✅ Display properly in MetaMask, OpenSea, and all NFT platforms

---

## 🔄 Migration Summary

### Issues Fixed
1. **Wrong baseNode**: Originally deployed with `0x0902329...` instead of correct `0x7e7650...`
   - Fixed by redeploying V2 registrar with correct namehash('base')
   
2. **Zero address helpers**: Controller deployed without RegistrationLimiter/FeeManager
   - Fixed by redeploying with proper helper contract addresses

### Deployment History
- **First V2 deployment**: Wrong baseNode ❌
- **Second V2 deployment**: Correct baseNode, wrong helpers ❌
- **Final V2 deployment**: Everything correct ✅

---

## 📝 Frontend Configuration

Updated in:
- `base-names-frontend/src/lib/contracts.ts`
- `base-names-frontend/src/sdk/BaseNamesSDK.ts`

Both files now point to the correct V2 contracts on both networks.

---

## 🚀 Ready to Use!

Users can now register domains with full NFT metadata support on both:
- **Base Sepolia**: For testing
- **Base Mainnet**: For production

All registrations will automatically store labels and generate beautiful metadata!
