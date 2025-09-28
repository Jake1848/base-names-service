import { keccak256, toBytes } from 'viem';

// Contract addresses and ABIs for Base Name Service
export const CONTRACTS = {
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
    "function available(uint256 id) view returns (bool)",
    "function ownerOf(uint256 tokenId) view returns (address)",
    "function nameExpires(uint256 id) view returns (uint256)",
    "function register(uint256 id, address owner, uint256 duration) external",
    "function controllers(address) view returns (bool)",
    "function addController(address controller) external"
  ],
  BasePriceOracle: [
    "function price(string name, uint256 expires, uint256 duration) view returns (uint256, uint256)"
  ],
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

// Known registered domains
export const REGISTERED_DOMAINS = [
  "testdomain",
  "alice",
  "bob",
  "charlie",
  "david",
  "eve",
  "crypto",
  "defi",
  "nft",
  "web3"
];

// Utility functions
export function labelHash(label: string): `0x${string}` {
  return keccak256(toBytes(label));
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