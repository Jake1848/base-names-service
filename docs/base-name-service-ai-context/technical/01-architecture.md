# Technical Architecture - Base Name Service

## System Overview

Base Name Service is a decentralized naming system built on Base L2, forked from ENS (Ethereum Name Service). It enables human-readable names (alice.base) to resolve to machine-readable identifiers (0x742d35Cc...).

## Architecture Layers

### 1. Registry Layer (Core)
**Contract**: `ENSRegistry.sol`
- Maintains ownership records for all domains
- Maps nodes (hashed names) to owners
- Handles subdomain creation
- Manages resolver and TTL settings

**Key Functions**:
```solidity
setOwner(bytes32 node, address owner)
setResolver(bytes32 node, address resolver)
setSubnodeOwner(bytes32 node, bytes32 label, address owner)
```

### 2. Registrar Layer (Domain Management)
**Contract**: `BaseRegistrarImplementation.sol`
- ERC-721 NFT contract for .base domains
- Manages domain lifecycle (registration, renewal, expiry)
- Interfaces with registry for ownership

**Key Features**:
- NFT compatibility (transferable, tradeable)
- Grace period (90 days post-expiry)
- Controller-based registration
- Expiry tracking

### 3. Controller Layer (Business Logic)
**Contract**: `BaseRegistrarController.sol`
- Handles registration process
- Implements commit-reveal scheme
- Calculates pricing
- Manages renewals

**Commit-Reveal Process**:
1. User commits hash(name + owner + secret)
2. Wait minimum 60 seconds
3. Reveal with actual values + payment
4. Domain registered if valid

### 4. Resolver Layer (Data Storage)
**Contract**: `PublicResolver.sol`
- Maps names to addresses
- Stores additional records (text, content hash)
- Supports multi-chain addresses
- Handles reverse resolution

**Record Types**:
- Address records (ETH and other chains)
- Content hash (IPFS websites)
- Text records (email, URL, avatar)
- ABI definitions
- Public keys

### 5. Price Oracle Layer
**Contract**: `BasePriceOracle.sol`
- Determines registration costs
- Implements tiered pricing
- Can add premium/auction logic

**Pricing Model**:
```
3 characters: 0.5 ETH/year
4 characters: 0.05 ETH/year
5+ characters: 0.005 ETH/year
```

## Data Structures

### Namehash Algorithm
Converts human-readable names to fixed-length hashes:
```javascript
namehash('alice.base') = keccak256(namehash('base'), keccak256('alice'))
```

### Node Structure
```
bytes32 node = namehash(full_domain_name)
```
- Used as unique identifier throughout system
- Prevents collision between names
- Enables hierarchical structure

### Domain States
1. **Available**: Not registered, can be claimed
2. **Registered**: Active registration, owned by user
3. **Expired**: Past expiry but in grace period
4. **Released**: Available after grace period

## Security Architecture

### Commit-Reveal Scheme
**Purpose**: Prevent front-running attacks

**Process**:
1. Commitment Phase:
   - User submits hash of intent
   - Timestamp recorded
   - No details revealed

2. Reveal Phase:
   - After 60 seconds, before 24 hours
   - Submit actual registration data
   - Payment included

3. Validation:
   - Verify commitment exists
   - Check timing windows
   - Confirm availability

### Access Control
```
Registry Owner → Can set TLD ownership
Registrar → Can create/modify .base domains
Controller → Can register/renew via registrar
Domain Owner → Can set resolver, create subdomains
Resolver Authority → Can modify domain records
```

### Security Features
- Reentrancy guards on payment functions
- Overflow protection in duration calculations
- Rate limiting via commit-reveal
- Grace period prevents accidental loss

## Integration Architecture

### Wallet Integration
```javascript
// MetaMask / Web3 Provider
const provider = new ethers.providers.Web3Provider(window.ethereum);

// Resolve name
const address = await provider.resolveName('alice.base');

// Reverse lookup
const name = await provider.lookupAddress('0x742d...');
```

### Smart Contract Integration
```solidity
interface IBaseNameService {
    function resolver(bytes32 node) external view returns (address);
    function owner(bytes32 node) external view returns (address);
}

// In your contract
address owner = baseNameService.owner(namehash("alice.base"));
```

### API Architecture
```
Frontend → Web3 Provider → Base RPC → Smart Contracts
                        ↓
                 Graph Protocol → Indexed Data
```

## Gas Optimization Strategies

### Registration Optimization
- Batch operations via multicall
- Efficient storage packing
- Minimal external calls
- Optimized string operations

### Storage Patterns
```solidity
// Packed struct for efficiency
struct Record {
    address owner;      // 20 bytes
    uint96 expires;     // 12 bytes - fits in one slot
}
```

### L2 Specific Optimizations
- Leverage Base's low gas costs
- Batch transactions when possible
- Use events for data availability
- Minimize calldata size

## Upgrade Architecture

### Current: Immutable Contracts
- Contracts deployed without proxy
- Security through simplicity
- No upgrade risks

### Future: Upgradeable Pattern
```solidity
// UUPS Proxy Pattern
contract BaseRegistrarV2 is UUPSUpgradeable {
    function _authorizeUpgrade(address newImplementation) 
        internal 
        override 
        onlyOwner 
    {}
}
```

### Migration Strategy
1. Deploy new contracts
2. Snapshot existing state
3. Migrate domain ownership
4. Update resolver pointers
5. Deprecate old contracts

## Scalability Architecture

### Current Capacity
- Theoretical: Unlimited domains
- Practical: Limited by Base L2 throughput
- ~2000 registrations/day sustainable

### Scaling Solutions
1. **Subdomain Delegation**
   - Offload to subdomain registrars
   - Reduce main registry load

2. **Layer 3 / State Channels**
   - Move subdomain logic off-chain
   - Commit merkle roots periodically

3. **Optimistic Updates**
   - Batch resolver updates
   - Challenge period for disputes

## Monitoring & Analytics

### On-Chain Metrics
- Registration volume
- Revenue generated
- Active domains
- Renewal rate
- Gas usage

### Event Monitoring
```solidity
event NameRegistered(
    string name,
    bytes32 indexed label,
    address indexed owner,
    uint256 cost,
    uint256 expires
);
```

### Analytics Stack
```
Smart Contracts → Events → Graph Protocol → Analytics DB → Dashboard
                        ↓
                  Web3 Indexer → API → Frontend
```

## Development Architecture

### Local Development
```bash
# Hardhat local node
npx hardhat node

# Deploy locally
npm run deploy:localhost

# Run tests
npm test
```

### Testnet Architecture
- Network: Base Sepolia
- Faucet: https://faucet.base.org
- Explorer: https://sepolia.basescan.org

### Mainnet Architecture
- Network: Base (Chain ID: 8453)
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

## API Endpoints

### Read Operations (Free)
```javascript
// Get owner
const owner = await registry.owner(node);

// Get resolver
const resolver = await registry.resolver(node);

// Resolve address
const address = await resolver.addr(node);
```

### Write Operations (Require Gas)
```javascript
// Register domain
await controller.register(name, owner, duration, secret, {value: price});

// Set resolver
await registry.setResolver(node, resolverAddress);

// Update address
await resolver.setAddr(node, newAddress);
```

## Error Handling

### Common Errors
```solidity
error NameNotAvailable(string name);
error CommitmentTooNew(bytes32 commitment);
error CommitmentTooOld(bytes32 commitment);
error InsufficientValue();
error Unauthorized();
```

### Error Recovery
- Commitment expired: Restart registration
- Insufficient payment: Recalculate price
- Name taken: Try different name
- Transaction failed: Check gas settings

## Performance Benchmarks

### Gas Costs (Estimated)
```
Registration: 200,000-250,000 gas
Renewal: 80,000-100,000 gas
Transfer: 40,000-60,000 gas
Set Resolver: 40,000-50,000 gas
Update Address: 35,000-45,000 gas
```

### Cost in USD (Base L2)
```
Registration: $0.40-0.50
Renewal: $0.16-0.20
Transfer: $0.08-0.12
```

## Future Architecture Considerations

### Cross-Chain Resolution
- Deploy on multiple L2s
- Unified namespace
- Bridge for transfers

### Advanced Features
- DNSSEC integration
- Email/DNS bridging
- Decentralized websites
- Identity verification

### Decentralization Path
1. Multi-sig control (Month 1)
2. Time-locked upgrades (Month 3)
3. DAO governance (Month 6)
4. Full decentralization (Year 1)
