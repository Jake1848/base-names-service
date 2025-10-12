import { keccak256, toBytes } from 'viem';

// Contract addresses and ABIs for Base Name Service
export const CONTRACTS = {
  BASE_MAINNET: {
    chainId: 8453,
    contracts: {
      ENSRegistry: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
      BaseRegistrar: "0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca", // V2 FIXED - correct baseNode
      BaseController: "0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8", // V2 FIXED - works with new registrar
      PublicResolver: "0x5D5bC53bDa5105561371FEf50B50E03aA94c962E",
      ReverseRegistrar: "0xD982f3bFf21dCb9421ffBC2000Cfe3C94A01c889",
      BasePriceOracle: "0xA1805458A1C1294D53eBBBd025B397F89Dd963AC",
      DomainMarketplace: "0x96F308aC9AAf5416733dFc92188320D24409D4D1" // V2 with fee fix - Oct 2025
    }
  },
  BASE_SEPOLIA: {
    chainId: 84532,
    contracts: {
      ENSRegistry: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      BaseRegistrar: "0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6", // V2 FIXED - correct baseNode
      ReverseRegistrar: "0xa1f10499B1D1a1c249443d82aaDA9ff7F3AE99cF",
      PublicResolver: "0x2927556a0761d6E4A6635CBE9988747625dAe125",
      BaseController: "0x9A2cf9387d74bBa208406DC98Ba3EEE3449a17ed", // V2 FIXED - works with new registrar
      BasePriceOracle: "0x3B7d21d238D158eA760FFdB8A5B9A1c3091Bd8c5",
      DomainMarketplace: "0x551Fa1F68656564410F4470162bd4b2B9B057268",
      DomainStaking: "0x6cFdDc0CBD82bAde4fa1DD3774FC72C248b7Af44"
    }
  }
};

// Simplified ABIs for the functions we need
export const ABIS = {
  BaseRegistrar: [
    {
      name: 'available',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'id', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }]
    },
    {
      name: 'ownerOf',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'address' }]
    },
    {
      name: 'nameExpires',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'id', type: 'uint256' }],
      outputs: [{ name: '', type: 'uint256' }]
    },
    {
      name: 'labels',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'string' }]
    },
    {
      name: 'register',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'id', type: 'uint256' },
        { name: 'owner', type: 'address' },
        { name: 'duration', type: 'uint256' }
      ],
      outputs: []
    }
  ] as const,
  BasePriceOracle: [
    {
      name: 'price',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'expires', type: 'uint256' },
        { name: 'duration', type: 'uint256' }
      ],
      outputs: [
        { name: 'basePremium', type: 'uint256' },
        { name: 'premium', type: 'uint256' }
      ]
    }
  ] as const,
  BaseController: [
    {
      name: 'makeCommitment',
      type: 'function',
      stateMutability: 'pure',
      inputs: [
        { name: 'label', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'duration', type: 'uint256' },
        { name: 'secret', type: 'bytes32' },
        { name: 'resolver', type: 'address' },
        { name: 'data', type: 'bytes[]' },
        { name: 'reverseRecord', type: 'bool' },
        { name: 'referrer', type: 'bytes32' },
        { name: 'fuses', type: 'uint256' }
      ],
      outputs: [{ name: 'commitment', type: 'bytes32' }]
    },
    {
      name: 'commit',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'commitment', type: 'bytes32' }],
      outputs: []
    },
    {
      name: 'register',
      type: 'function',
      stateMutability: 'payable',
      inputs: [
        { name: 'label', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'duration', type: 'uint256' },
        { name: 'secret', type: 'bytes32' },
        { name: 'resolver', type: 'address' },
        { name: 'data', type: 'bytes[]' },
        { name: 'reverseRecord', type: 'bool' },
        { name: 'referrer', type: 'bytes32' },
        { name: 'fuses', type: 'uint256' }
      ],
      outputs: []
    },
    {
      name: 'rentPrice',
      type: 'function',
      stateMutability: 'view',
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'duration', type: 'uint256' }
      ],
      outputs: [
        { name: 'base', type: 'uint256' },
        { name: 'premium', type: 'uint256' }
      ]
    }
  ] as const,
  ENSRegistry: [
    "function owner(bytes32 node) view returns (address)",
    "function resolver(bytes32 node) view returns (address)",
    "function setSubnodeOwner(bytes32 node, bytes32 label, address owner) external"
  ],
  PublicResolver: [
    "function addr(bytes32 node) view returns (address)",
    "function setAddr(bytes32 node, address addr) external",
    "function text(bytes32 node, string key) view returns (string)",
    "function setText(bytes32 node, string key, string value) external"
  ],
  DomainMarketplace: [
    {
      name: 'createListing',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [
        { name: 'tokenId', type: 'uint256' },
        { name: 'price', type: 'uint256' }
      ],
      outputs: []
    },
    {
      name: 'buyListing',
      type: 'function',
      stateMutability: 'payable',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: []
    },
    {
      name: 'cancelListing',
      type: 'function',
      stateMutability: 'nonpayable',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: []
    },
    {
      name: 'getListing',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [
        { name: 'seller', type: 'address' },
        { name: 'price', type: 'uint256' },
        { name: 'createdAt', type: 'uint256' },
        { name: 'active', type: 'bool' }
      ]
    },
    {
      name: 'isListed',
      type: 'function',
      stateMutability: 'view',
      inputs: [{ name: 'tokenId', type: 'uint256' }],
      outputs: [{ name: '', type: 'bool' }]
    }
  ] as const
};

// Premium domains available for registration
// Premium domains organized by category
export const PREMIUM_DOMAINS_CATEGORIES = {
  crypto: [
    "btc", "eth", "sol", "bnb", "ada", "dot", "matic", "link", "uni", "aave"
  ],
  brands: [
    "coinbase", "base", "opensea", "uniswap", "metamask", "binance", "kraken"
  ],
  web3: [
    "web3", "defi", "nft", "dao", "dapp", "meta", "verse", "chain", "block"
  ],
  finance: [
    "bank", "pay", "swap", "lend", "loan", "cash", "mint", "burn", "yield"
  ],
  names: [
    "john", "alice", "bob", "charlie", "david", "emma", "frank", "grace"
  ],
  singles: [
    "a", "b", "c", "x", "y", "z", "0", "1", "7", "8", "9"
  ],
  tech: [
    "ai", "app", "api", "dev", "code", "data", "tech", "node", "core"
  ],
  gaming: [
    "game", "play", "win", "level", "score", "hero", "quest", "raid"
  ]
};

// Flatten all premium domains for backward compatibility
export const PREMIUM_DOMAINS = Object.values(PREMIUM_DOMAINS_CATEGORIES).flat();

// Domain pricing tiers
export const DOMAIN_PRICING = {
  premium: "0.1",  // ETH
  rare: "0.05",     // ETH
  standard: "0.01"  // ETH
};

// Get domain tier based on characteristics
export function getDomainTier(domain: string): 'premium' | 'rare' | 'standard' {
  if (domain.length === 1) return 'premium';
  if (domain.length === 2) return 'premium';
  if (domain.length === 3) return 'rare';
  if (PREMIUM_DOMAINS.includes(domain)) return 'rare';
  return 'standard';
}

// Get contracts for the current network
export function getContractsForChain(chainId: number) {
  if (chainId === 8453) {
    return CONTRACTS.BASE_MAINNET.contracts;
  } else if (chainId === 84532) {
    return CONTRACTS.BASE_SEPOLIA.contracts;
  }
  // Default to mainnet
  return CONTRACTS.BASE_MAINNET.contracts;
}

// Check if chain is supported
export function isSupportedChain(chainId: number): boolean {
  return chainId === 8453 || chainId === 84532;
}

// Get network name
export function getNetworkName(chainId: number): string {
  if (chainId === 8453) return 'Base Mainnet';
  if (chainId === 84532) return 'Base Sepolia (Testnet)';
  return 'Unknown Network';
}

// Utility functions
export function labelHash(label: string): bigint {
  const hash = keccak256(toBytes(label));
  return BigInt(hash);
}

export function namehash(name: string): `0x${string}` {
  if (name === '') {
    return '0x0000000000000000000000000000000000000000000000000000000000000000';
  }

  const labels = name.split('.');
  let hash = '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`;

  for (let i = labels.length - 1; i >= 0; i--) {
    const labelHashValue = keccak256(toBytes(labels[i]));
    hash = keccak256(new Uint8Array([...toBytes(hash), ...toBytes(labelHashValue)]));
  }

  return hash;
}
