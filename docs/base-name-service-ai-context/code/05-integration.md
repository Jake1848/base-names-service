# Code Examples - Base Name Service Integration

## Quick Integration Examples

### Basic Web3 Integration

```javascript
// Resolve a .base name to address
async function resolveBaseName(name) {
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
    const resolver = new ethers.Contract(RESOLVER_ADDRESS, RESOLVER_ABI, provider);
    
    // Calculate namehash
    const node = ethers.utils.namehash(`${name}.base`);
    
    // Get address
    const address = await resolver.addr(node);
    return address;
}

// Usage
const vitalikAddress = await resolveBaseName('vitalik');
```

### React Hook for Base Names

```javascript
// useBaseName.js
import { useState, useEffect } from 'react';
import { ethers } from 'ethers';

function useBaseName(address) {
    const [name, setName] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function fetchName() {
            try {
                const provider = new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
                const reverseResolver = new ethers.Contract(
                    REVERSE_RESOLVER_ADDRESS,
                    ['function name(bytes32) view returns (string)'],
                    provider
                );
                
                // Convert address to reverse node
                const reverseNode = `${address.slice(2).toLowerCase()}.addr.reverse`;
                const node = ethers.utils.namehash(reverseNode);
                
                const name = await reverseResolver.name(node);
                setName(name);
            } catch (error) {
                console.error('Error fetching name:', error);
            } finally {
                setLoading(false);
            }
        }
        
        if (address) {
            fetchName();
        }
    }, [address]);
    
    return { name, loading };
}

// Usage in component
function UserProfile({ userAddress }) {
    const { name, loading } = useBaseName(userAddress);
    
    return (
        <div>
            {loading ? 'Loading...' : name || userAddress}
        </div>
    );
}
```

### Smart Contract Integration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface IBaseNameService {
    function resolver(bytes32 node) external view returns (address);
}

interface IResolver {
    function addr(bytes32 node) external view returns (address);
}

contract MyDApp {
    IBaseNameService constant BNS = IBaseNameService(0x...); // Registry address
    
    // Resolve .base name to address
    function sendToBaseName(string memory name) public payable {
        // Calculate namehash for name.base
        bytes32 node = namehash(name, "base");
        
        // Get resolver
        address resolverAddress = BNS.resolver(node);
        require(resolverAddress != address(0), "Name not found");
        
        // Get address from resolver
        IResolver resolver = IResolver(resolverAddress);
        address recipient = resolver.addr(node);
        require(recipient != address(0), "Name not resolved");
        
        // Send ETH
        (bool success,) = recipient.call{value: msg.value}("");
        require(success, "Transfer failed");
    }
    
    // Calculate namehash (simplified)
    function namehash(string memory name, string memory tld) 
        private 
        pure 
        returns (bytes32) 
    {
        bytes32 tldHash = keccak256(abi.encodePacked(bytes32(0), keccak256(bytes(tld))));
        return keccak256(abi.encodePacked(tldHash, keccak256(bytes(name))));
    }
}
```

## Registration Flow Implementation

### Frontend Registration with Commit-Reveal

```javascript
class BaseNameRegistration {
    constructor(provider, controllerAddress) {
        this.provider = provider;
        this.signer = provider.getSigner();
        this.controller = new ethers.Contract(
            controllerAddress,
            CONTROLLER_ABI,
            this.signer
        );
    }
    
    async checkAvailability(name) {
        return await this.controller.available(name);
    }
    
    async getPrice(name, duration) {
        const priceData = await this.controller.rentPrice(name, duration);
        return priceData.base.add(priceData.premium);
    }
    
    async register(name, duration) {
        // Check availability
        const available = await this.checkAvailability(name);
        if (!available) {
            throw new Error('Name not available');
        }
        
        // Get price
        const price = await this.getPrice(name, duration);
        
        // Generate secret
        const secret = ethers.utils.randomBytes(32);
        const owner = await this.signer.getAddress();
        
        // Step 1: Commit
        const commitment = await this.controller.makeCommitment(
            name,
            owner,
            duration,
            secret,
            ethers.constants.AddressZero, // resolver
            [],  // data
            false, // reverseRecord
            0,    // fuses
            0     // wrapperExpiry
        );
        
        console.log('Submitting commitment...');
        const commitTx = await this.controller.commit(commitment);
        await commitTx.wait();
        
        // Step 2: Wait for commitment to mature (60 seconds)
        console.log('Waiting 60 seconds...');
        await new Promise(resolve => setTimeout(resolve, 61000));
        
        // Step 3: Register
        console.log('Registering name...');
        const registerTx = await this.controller.register(
            name,
            owner,
            duration,
            secret,
            ethers.constants.AddressZero,
            [],
            false,
            0,
            0,
            { value: price }
        );
        
        await registerTx.wait();
        console.log('Registration complete!');
        
        return registerTx.hash;
    }
}

// Usage
const registration = new BaseNameRegistration(provider, CONTROLLER_ADDRESS);
await registration.register('myname', 365 * 24 * 60 * 60); // 1 year
```

### Subdomain Creation

```javascript
async function createSubdomain(parentDomain, subdomain, owner) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    
    const registry = new ethers.Contract(REGISTRY_ADDRESS, REGISTRY_ABI, signer);
    
    // Calculate parent node
    const parentNode = ethers.utils.namehash(`${parentDomain}.base`);
    
    // Calculate label hash for subdomain
    const label = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(subdomain));
    
    // Set subdomain owner
    const tx = await registry.setSubnodeOwner(parentNode, label, owner);
    await tx.wait();
    
    return `${subdomain}.${parentDomain}.base`;
}

// Usage: Create team.company.base
await createSubdomain('company', 'team', '0x742d...');
```

## Advanced Resolver Features

### Multi-Chain Address Resolution

```javascript
// Set addresses for multiple chains
async function setMultiChainAddresses(name, addresses) {
    const resolver = new ethers.Contract(RESOLVER_ADDRESS, RESOLVER_ABI, signer);
    const node = ethers.utils.namehash(`${name}.base`);
    
    // Chain IDs
    const CHAIN_IDS = {
        ethereum: 60,
        bitcoin: 0,
        litecoin: 2,
        dogecoin: 3,
        polygon: 966,
        // ... more chains
    };
    
    // Set each address
    for (const [chain, address] of Object.entries(addresses)) {
        const chainId = CHAIN_IDS[chain];
        await resolver.setAddr(node, chainId, address);
    }
}

// Usage
await setMultiChainAddresses('alice', {
    ethereum: '0x742d35Cc...',
    bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    polygon: '0x742d35Cc...'
});
```

### Text Records Management

```javascript
class TextRecords {
    constructor(resolverAddress, signer) {
        this.resolver = new ethers.Contract(
            resolverAddress,
            RESOLVER_ABI,
            signer
        );
    }
    
    async setText(name, key, value) {
        const node = ethers.utils.namehash(`${name}.base`);
        const tx = await this.resolver.setText(node, key, value);
        await tx.wait();
    }
    
    async getText(name, key) {
        const node = ethers.utils.namehash(`${name}.base`);
        return await this.resolver.text(node, key);
    }
    
    async setProfile(name, profile) {
        // Set multiple text records
        const records = [
            ['email', profile.email],
            ['url', profile.website],
            ['avatar', profile.avatar],
            ['description', profile.bio],
            ['com.twitter', profile.twitter],
            ['com.github', profile.github],
            ['com.discord', profile.discord]
        ];
        
        for (const [key, value] of records) {
            if (value) {
                await this.setText(name, key, value);
            }
        }
    }
}

// Usage
const textRecords = new TextRecords(RESOLVER_ADDRESS, signer);
await textRecords.setProfile('alice', {
    email: 'alice@example.com',
    website: 'https://alice.com',
    twitter: '@alice',
    bio: 'Web3 developer'
});
```

### Content Hash for IPFS Websites

```javascript
// Set IPFS website for .base domain
async function setIPFSWebsite(name, ipfsHash) {
    const resolver = new ethers.Contract(RESOLVER_ADDRESS, RESOLVER_ABI, signer);
    const node = ethers.utils.namehash(`${name}.base`);
    
    // Convert IPFS hash to bytes
    // Format: ipfs://QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco
    const contentHash = `0x${Buffer.from(`ipfs://${ipfsHash}`).toString('hex')}`;
    
    const tx = await resolver.setContenthash(node, contentHash);
    await tx.wait();
    
    return `ipfs://${ipfsHash}`;
}

// Usage
await setIPFSWebsite('myproject', 'QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco');
```

## SDK Implementation

### Simple Base Name Service SDK

```javascript
// base-name-service-sdk.js
class BaseNameService {
    constructor(config = {}) {
        this.provider = config.provider || 
            new ethers.providers.JsonRpcProvider('https://mainnet.base.org');
        
        this.addresses = config.addresses || {
            registry: REGISTRY_ADDRESS,
            controller: CONTROLLER_ADDRESS,
            resolver: RESOLVER_ADDRESS,
            reverseResolver: REVERSE_RESOLVER_ADDRESS
        };
        
        this.contracts = this._initContracts();
    }
    
    _initContracts() {
        return {
            registry: new ethers.Contract(
                this.addresses.registry,
                REGISTRY_ABI,
                this.provider
            ),
            controller: new ethers.Contract(
                this.addresses.controller,
                CONTROLLER_ABI,
                this.provider
            ),
            resolver: new ethers.Contract(
                this.addresses.resolver,
                RESOLVER_ABI,
                this.provider
            )
        };
    }
    
    // Core functions
    async resolve(name) {
        const node = ethers.utils.namehash(`${name}.base`);
        return await this.contracts.resolver.addr(node);
    }
    
    async reverse(address) {
        const reverseNode = `${address.slice(2).toLowerCase()}.addr.reverse`;
        const node = ethers.utils.namehash(reverseNode);
        return await this.contracts.reverseResolver.name(node);
    }
    
    async owner(name) {
        const node = ethers.utils.namehash(`${name}.base`);
        return await this.contracts.registry.owner(node);
    }
    
    async available(name) {
        return await this.contracts.controller.available(name);
    }
    
    async getPrice(name, duration = 31536000) { // 1 year default
        const priceData = await this.contracts.controller.rentPrice(name, duration);
        return priceData.base.add(priceData.premium);
    }
    
    async getProfile(name) {
        const node = ethers.utils.namehash(`${name}.base`);
        const keys = ['email', 'url', 'avatar', 'description', 'com.twitter', 'com.github'];
        const profile = {};
        
        for (const key of keys) {
            profile[key] = await this.contracts.resolver.text(node, key);
        }
        
        return profile;
    }
}

// Export for use
export default BaseNameService;

// Usage
import BaseNameService from 'base-name-service-sdk';

const bns = new BaseNameService();
const address = await bns.resolve('vitalik');
const name = await bns.reverse('0x742d35Cc...');
const profile = await bns.getProfile('alice');
```

## Testing Examples

### Unit Tests for Registration

```javascript
// test/registration.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Base Name Registration", function () {
    let controller, oracle, owner, user;
    const TEST_NAME = "testname";
    const DURATION = 31536000; // 1 year
    
    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        
        // Deploy contracts
        // ... deployment code
    });
    
    describe("Registration", function () {
        it("Should register a name successfully", async function () {
            // Check availability
            expect(await controller.available(TEST_NAME)).to.equal(true);
            
            // Get price
            const price = await controller.rentPrice(TEST_NAME, DURATION);
            
            // Make commitment
            const secret = ethers.utils.randomBytes(32);
            const commitment = await controller.makeCommitment(
                TEST_NAME,
                user.address,
                DURATION,
                secret,
                ethers.constants.AddressZero,
                [],
                false,
                0,
                0
            );
            
            // Commit
            await controller.connect(user).commit(commitment);
            
            // Wait for commitment age
            await network.provider.send("evm_increaseTime", [61]);
            await network.provider.send("evm_mine");
            
            // Register
            await expect(
                controller.connect(user).register(
                    TEST_NAME,
                    user.address,
                    DURATION,
                    secret,
                    ethers.constants.AddressZero,
                    [],
                    false,
                    0,
                    0,
                    { value: price }
                )
            ).to.emit(controller, "NameRegistered")
             .withArgs(TEST_NAME, ethers.utils.id(TEST_NAME), user.address);
            
            // Verify ownership
            const node = ethers.utils.namehash(`${TEST_NAME}.base`);
            expect(await registry.owner(node)).to.equal(user.address);
        });
        
        it("Should prevent registration of unavailable names", async function () {
            // Register first
            // ... register TEST_NAME
            
            // Try to register again
            expect(await controller.available(TEST_NAME)).to.equal(false);
            
            await expect(
                controller.connect(user).register(
                    TEST_NAME,
                    // ... parameters
                )
            ).to.be.revertedWith("Name not available");
        });
    });
});
```

## Gas Optimization Examples

```solidity
// Optimized batch registration
contract BatchRegistrar {
    IController public controller;
    
    function batchRegister(
        string[] calldata names,
        address owner,
        uint256 duration,
        bytes32[] calldata secrets
    ) external payable {
        uint256 totalCost;
        
        // First pass: calculate total cost and commit
        for (uint i = 0; i < names.length; i++) {
            uint256 price = controller.rentPrice(names[i], duration);
            totalCost += price;
            
            bytes32 commitment = controller.makeCommitment(
                names[i], owner, duration, secrets[i], 
                address(0), "", false, 0, 0
            );
            controller.commit(commitment);
        }
        
        require(msg.value >= totalCost, "Insufficient payment");
        
        // Wait period would need to be handled off-chain
        // Second pass: register all names
        // ... registration logic
    }
}
```

## Error Handling Examples

```javascript
async function safeRegister(name) {
    try {
        // Check availability
        if (!await controller.available(name)) {
            throw new Error(`${name}.base is not available`);
        }
        
        // Check name validity
        if (name.length < 3) {
            throw new Error('Name must be at least 3 characters');
        }
        
        if (!/^[a-z0-9-]+$/.test(name)) {
            throw new Error('Name can only contain lowercase letters, numbers, and hyphens');
        }
        
        // Get price and check balance
        const price = await controller.rentPrice(name, DURATION);
        const balance = await signer.getBalance();
        
        if (balance.lt(price)) {
            throw new Error(`Insufficient balance. Need ${ethers.utils.formatEther(price)} ETH`);
        }
        
        // Proceed with registration
        return await register(name);
        
    } catch (error) {
        if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
            throw new Error('Transaction would fail. Name might be taken.');
        }
        
        if (error.code === 'INSUFFICIENT_FUNDS') {
            throw new Error('Insufficient ETH for gas fees');
        }
        
        throw error;
    }
}
```

These code examples provide everything needed to integrate with Base Name Service!
