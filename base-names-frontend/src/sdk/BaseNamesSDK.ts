/**
 * Base Names Service SDK
 * Official TypeScript SDK for integrating .base domain functionality into your application
 *
 * @example
 * ```typescript
 * import { BaseNamesSDK } from '@base-names/sdk';
 *
 * const sdk = new BaseNamesSDK({
 *   chainId: 8453, // Base Mainnet
 *   provider: window.ethereum
 * });
 *
 * // Check domain availability
 * const isAvailable = await sdk.domains.isAvailable('myname');
 *
 * // Register a domain
 * await sdk.domains.register('myname', {
 *   duration: 365, // days
 *   owner: '0x...'
 * });
 * ```
 */

import { createPublicClient, createWalletClient, custom, http, parseEther, formatEther, Address, Hash, keccak256, toHex } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export interface SDKConfig {
  chainId: number;
  provider?: any; // EIP-1193 provider (window.ethereum)
  rpcUrl?: string;
}

export interface DomainInfo {
  name: string;
  tokenId: bigint;
  owner: Address;
  expires: bigint;
  available: boolean;
}

export interface RegistrationOptions {
  duration: number; // in days
  owner: Address;
  resolver?: Address;
  reverseRecord?: boolean;
}

export interface ListingInfo {
  tokenId: bigint;
  seller: Address;
  price: bigint;
  active: boolean;
}

export interface AuctionInfo {
  tokenId: bigint;
  seller: Address;
  startPrice: bigint;
  currentBid: bigint;
  highestBidder: Address;
  endTime: bigint;
  active: boolean;
}

// Contract ABIs (simplified for SDK)
const REGISTRAR_ABI = [
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
  }
] as const;

const CONTROLLER_ABI = [
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
] as const;

export class BaseNamesSDK {
  private config: SDKConfig;
  private publicClient: any;
  private walletClient: any;

  // Contract addresses
  private readonly CONTRACTS = {
    8453: { // Base Mainnet
      registrar: '0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca' as Address, // V2 FIXED - correct baseNode
      controller: '0x0BDbd26f79a6Ef1339a95aDe6180a823dD0152a8' as Address, // V2 FIXED - works with new registrar
      resolver: '0x5D5bC53bDa5105561371FEf50B50E03aA94c962E' as Address,
    },
    84532: { // Base Sepolia
      registrar: '0xc22BB0C1C7D611686CF9DE6894Bf9B6D87D24ba6' as Address, // V2 FIXED - correct baseNode
      controller: '0x8E3132Ce6649627a8Cd5372F4a5Ebf553df5eaf6' as Address, // V2 FIXED - works with new registrar
      resolver: '0x2927556a0761d6E4A6635CBE9988747625dAe125' as Address,
    }
  };

  constructor(config: SDKConfig) {
    this.config = config;

    const chain = config.chainId === 8453 ? base : baseSepolia;

    // Create public client for read operations
    this.publicClient = createPublicClient({
      chain,
      transport: config.rpcUrl ? http(config.rpcUrl) : http()
    });

    // Create wallet client if provider available
    if (config.provider) {
      this.walletClient = createWalletClient({
        chain,
        transport: custom(config.provider)
      });
    }
  }

  /**
   * Domain Operations
   */
  public domains = {
    /**
     * Check if a domain name is available for registration
     */
    isAvailable: async (name: string): Promise<boolean> => {
      const tokenId = this.nameToTokenId(name);
      const contracts = this.CONTRACTS[this.config.chainId as keyof typeof this.CONTRACTS];

      const available = await this.publicClient.readContract({
        address: contracts.registrar,
        abi: REGISTRAR_ABI,
        functionName: 'available',
        args: [tokenId]
      });

      return available as boolean;
    },

    /**
     * Get information about a domain
     */
    getInfo: async (name: string): Promise<DomainInfo> => {
      const tokenId = this.nameToTokenId(name);
      const contracts = this.CONTRACTS[this.config.chainId as keyof typeof this.CONTRACTS];

      // Check availability first
      const available = await this.publicClient.readContract({
        address: contracts.registrar,
        abi: REGISTRAR_ABI,
        functionName: 'available',
        args: [tokenId]
      }) as boolean;

      // Then fetch owner and expires if not available
      const [owner, expires] = await Promise.all([
        available ? Promise.resolve('0x0000000000000000000000000000000000000000' as Address) :
          this.publicClient.readContract({
            address: contracts.registrar,
            abi: REGISTRAR_ABI,
            functionName: 'ownerOf',
            args: [tokenId]
          }),
        available ? Promise.resolve(BigInt(0)) :
          this.publicClient.readContract({
            address: contracts.registrar,
            abi: REGISTRAR_ABI,
            functionName: 'nameExpires',
            args: [tokenId]
          })
      ]);

      return {
        name,
        tokenId,
        owner: owner as Address,
        expires: expires as bigint,
        available: available as boolean
      };
    },

    /**
     * Get the price to register a domain
     */
    getPrice: async (name: string, durationInDays: number): Promise<{
      base: bigint;
      premium: bigint;
      total: bigint;
    }> => {
      const contracts = this.CONTRACTS[this.config.chainId as keyof typeof this.CONTRACTS];
      const duration = BigInt(durationInDays * 24 * 60 * 60);

      const result = await this.publicClient.readContract({
        address: contracts.controller,
        abi: CONTROLLER_ABI,
        functionName: 'rentPrice',
        args: [name, duration]
      }) as [bigint, bigint];

      return {
        base: result[0],
        premium: result[1],
        total: result[0] + result[1]
      };
    },

    /**
     * Register a domain (requires wallet connection)
     */
    register: async (name: string, options: RegistrationOptions): Promise<Hash> => {
      if (!this.walletClient) {
        throw new Error('Wallet client not initialized. Please provide a provider in SDK config.');
      }

      const contracts = this.CONTRACTS[this.config.chainId as keyof typeof this.CONTRACTS];
      const duration = BigInt(options.duration * 24 * 60 * 60);

      // Get price
      const price = await this.domains.getPrice(name, options.duration);

      // Generate secret for commitment (simplified - should use commitment scheme)
      const secret = `0x${'0'.repeat(64)}` as `0x${string}`;

      // Register
      const hash = await this.walletClient.writeContract({
        address: contracts.controller,
        abi: CONTROLLER_ABI,
        functionName: 'register',
        args: [
          name,
          options.owner,
          duration,
          secret,
          options.resolver || contracts.resolver,
          [],
          options.reverseRecord || false,
          0
        ],
        value: price.total
      });

      return hash;
    }
  };

  /**
   * Marketplace Operations
   */
  public marketplace = {
    /**
     * Get listing information for a domain
     */
    getListing: async (tokenId: bigint): Promise<ListingInfo | null> => {
      // Would query marketplace contract
      // Placeholder for now
      return null;
    },

    /**
     * List a domain for sale
     */
    createListing: async (tokenId: bigint, price: bigint): Promise<Hash> => {
      if (!this.walletClient) {
        throw new Error('Wallet client not initialized');
      }

      // Would call marketplace contract
      throw new Error('Not implemented - marketplace contract needed');
    },

    /**
     * Buy a listed domain
     */
    buyListing: async (tokenId: bigint): Promise<Hash> => {
      if (!this.walletClient) {
        throw new Error('Wallet client not initialized');
      }

      // Would call marketplace contract
      throw new Error('Not implemented - marketplace contract needed');
    }
  };

  /**
   * Auction Operations
   */
  public auctions = {
    /**
     * Get auction information for a domain
     */
    getAuction: async (tokenId: bigint): Promise<AuctionInfo | null> => {
      // Would query marketplace contract
      // Placeholder for now
      return null;
    },

    /**
     * Create an auction for a domain
     */
    createAuction: async (tokenId: bigint, startPrice: bigint, durationInHours: number): Promise<Hash> => {
      if (!this.walletClient) {
        throw new Error('Wallet client not initialized');
      }

      // Would call marketplace contract
      throw new Error('Not implemented - marketplace contract needed');
    },

    /**
     * Place a bid on an auction
     */
    placeBid: async (tokenId: bigint, bidAmount: bigint): Promise<Hash> => {
      if (!this.walletClient) {
        throw new Error('Wallet client not initialized');
      }

      // Would call marketplace contract
      throw new Error('Not implemented - marketplace contract needed');
    }
  };

  /**
   * Utility Functions
   */

  /**
   * Convert domain name to token ID (labelhash)
   */
  public nameToTokenId(name: string): bigint {
    return BigInt(keccak256(toHex(name.toLowerCase())));
  }

  /**
   * Format ETH amount for display
   */
  public formatEth(wei: bigint): string {
    return formatEther(wei);
  }

  /**
   * Parse ETH amount to wei
   */
  public parseEth(eth: string): bigint {
    return parseEther(eth);
  }
}

/**
 * React Hooks for easier integration
 */
export function useBaseNames(config: SDKConfig) {
  const sdk = new BaseNamesSDK(config);
  return sdk;
}

export default BaseNamesSDK;
