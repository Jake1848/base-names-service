import { keccak256, toBytes } from 'viem';

// Contract addresses and ABIs for Base Name Service
export const CONTRACTS = {
  BASE_MAINNET: {
    chainId: 8453,
    contracts: {
      ENSRegistry: "0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E",
      BaseRegistrar: "0xD158de26c787ABD1E0f2955C442fea9d4DC0a917",
      BaseController: "0xca7FD90f4C76FbCdbdBB3427804374b16058F55e",
      PublicResolver: "0x5D5bC53bDa5105561371FEf50B50E03aA94c962E",
      ReverseRegistrar: "0xD982f3bFf21dCb9421ffBC2000Cfe3C94A01c889",
      BasePriceOracle: "0xA1805458A1C1294D53eBBBd025B397F89Dd963AC"
    }
  },
  BASE_SEPOLIA: {
    chainId: 84532,
    contracts: {
      ENSRegistry: "0x5928B6Ff35f61056fCA003A1F8a000d4e89e6F00",
      BaseRegistrar: "0xB364eb42E361b923244eC9ad6A0bc57fAfDaB15b",
      ReverseRegistrar: "0xC97018De65cDD20c6e9d264316139efA747b2E7A",
      PublicResolver: "0x6C421ca8356886E5634B267A340102c597c2a352",
      BasePriceOracle: "0x83eF9752EE4f706Ce1f6aa3D32fA1f9f07c2baEb"
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
      name: 'register',
      type: 'function',
      stateMutability: 'payable',
      inputs: [
        { name: 'name', type: 'string' },
        { name: 'owner', type: 'address' },
        { name: 'duration', type: 'uint256' },
        { name: 'secret', type: 'bytes32' },
        { name: 'resolver', type: 'address' },
        { name: 'data', type: 'bytes[]' },
        { name: 'reverseRecord', type: 'bool' },
        { name: 'ownerControlledFuses', type: 'uint16' }
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
  ]
};

// Premium domains available for registration
export const PREMIUM_DOMAINS = [
  "eth",
  "coinbase",
  "base",
  "web3",
  "defi",
  "nft",
  "crypto",
  "blockchain",
  "bitcoin",
  "ethereum"
];

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