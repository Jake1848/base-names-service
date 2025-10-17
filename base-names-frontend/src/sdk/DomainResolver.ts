/**
 * Base Names Domain Resolver SDK
 *
 * Resolves .base domains to wallet addresses
 * Works TODAY without wallet support - just needs contract queries
 *
 * Usage:
 *   const resolver = new DomainResolver(publicClient);
 *   const address = await resolver.resolve('alice.base');
 *   // Send ETH to address
 */

import { createPublicClient, http, type PublicClient, type Address } from 'viem';
import { base } from 'viem/chains';
import crypto from 'crypto';

// Contract addresses on Base Mainnet
const CONTRACTS = {
  ENSRegistry: '0x5f0C3a1d7B285262cce8D8716bf9718feA6D0f9E' as Address,
  PublicResolver: '0x...' as Address, // TODO: Add your resolver address
  BaseRegistrar: '0x53F9f3352ea2587734aCA72A5489eB8E7b5444Ca' as Address,
};

// ABI for ENS Registry - minimal interface
const ENS_REGISTRY_ABI = [
  {
    name: 'resolver',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
] as const;

// ABI for Public Resolver - minimal interface
const PUBLIC_RESOLVER_ABI = [
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
] as const;

/**
 * Calculate namehash for ENS-style domain
 */
function namehash(name: string): `0x${string}` {
  let node = '0x' + '0'.repeat(64);

  if (name) {
    const labels = name.split('.');
    for (let i = labels.length - 1; i >= 0; i--) {
      const labelHash = crypto.createHash('sha256').update(labels[i]).digest('hex');
      node = crypto.createHash('sha256').update(Buffer.from(node.slice(2) + labelHash, 'hex')).digest('hex');
      node = '0x' + node;
    }
  }

  return node as `0x${string}`;
}

export interface ResolvedDomain {
  name: string;
  address: Address;
  avatar?: string;
  email?: string;
  url?: string;
  twitter?: string;
  github?: string;
  discord?: string;
}

export class DomainResolver {
  private client: PublicClient;

  constructor(client?: PublicClient) {
    this.client = (client || createPublicClient({
      chain: base,
      transport: http(
        process.env.NEXT_PUBLIC_INFURA_API_KEY
          ? `https://base-mainnet.infura.io/v3/${process.env.NEXT_PUBLIC_INFURA_API_KEY}`
          : 'https://mainnet.base.org'
      ),
    })) as PublicClient;
  }

  /**
   * Resolve a .base domain to an Ethereum address
   *
   * @param domain - The domain to resolve (e.g., 'alice.base')
   * @returns The resolved Ethereum address or null if not found
   */
  async resolve(domain: string): Promise<Address | null> {
    try {
      // Normalize domain name
      const normalizedName = this.normalizeDomain(domain);

      // Calculate node hash
      const node = namehash(normalizedName);

      // Get resolver address from ENS Registry
      const resolverAddress = await this.client.readContract({
        address: CONTRACTS.ENSRegistry,
        abi: ENS_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      });

      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      // Get address from resolver
      const address = await this.client.readContract({
        address: resolverAddress,
        abi: PUBLIC_RESOLVER_ABI,
        functionName: 'addr',
        args: [node],
      });

      if (!address || address === '0x0000000000000000000000000000000000000000') {
        return null;
      }

      return address as Address;

    } catch (error) {
      console.error('Error resolving domain:', error);
      return null;
    }
  }

  /**
   * Resolve a domain and get full profile information
   */
  async resolveWithProfile(domain: string): Promise<ResolvedDomain | null> {
    try {
      const address = await this.resolve(domain);

      if (!address) {
        return null;
      }

      const normalizedName = this.normalizeDomain(domain);
      const node = namehash(normalizedName);

      // Get resolver address
      const resolverAddress = await this.client.readContract({
        address: CONTRACTS.ENSRegistry,
        abi: ENS_REGISTRY_ABI,
        functionName: 'resolver',
        args: [node],
      });

      if (!resolverAddress || resolverAddress === '0x0000000000000000000000000000000000000000') {
        return { name: normalizedName, address };
      }

      // Fetch text records in parallel
      const [avatar, email, url, twitter, github, discord] = await Promise.all([
        this.getText(resolverAddress, node, 'avatar'),
        this.getText(resolverAddress, node, 'email'),
        this.getText(resolverAddress, node, 'url'),
        this.getText(resolverAddress, node, 'com.twitter'),
        this.getText(resolverAddress, node, 'com.github'),
        this.getText(resolverAddress, node, 'com.discord'),
      ]);

      return {
        name: normalizedName,
        address,
        avatar: avatar || undefined,
        email: email || undefined,
        url: url || undefined,
        twitter: twitter || undefined,
        github: github || undefined,
        discord: discord || undefined,
      };

    } catch (error) {
      console.error('Error resolving domain with profile:', error);
      return null;
    }
  }

  /**
   * Get text record from resolver
   */
  private async getText(
    resolverAddress: Address,
    node: `0x${string}`,
    key: string
  ): Promise<string | null> {
    try {
      const text = await this.client.readContract({
        address: resolverAddress,
        abi: PUBLIC_RESOLVER_ABI,
        functionName: 'text',
        args: [node, key],
      });

      return text || null;
    } catch {
      return null;
    }
  }

  /**
   * Normalize domain name (ensure .base suffix)
   */
  private normalizeDomain(domain: string): string {
    domain = domain.trim().toLowerCase();

    if (!domain.endsWith('.base')) {
      domain = domain + '.base';
    }

    return domain;
  }

  /**
   * Check if a domain is available for registration
   */
  async isAvailable(domain: string): Promise<boolean> {
    const address = await this.resolve(domain);
    return address === null;
  }

  /**
   * Reverse resolution: Get .base domain for an address
   */
  async reverse(_address: Address): Promise<string | null> {
    try {
      // Reverse resolution would query the reverse registrar
      // This requires the reverse registrar contract to be set up
      // For now, return null
      // TODO: Implement reverse resolution when reverse registrar is deployed
      return null;
    } catch (error) {
      console.error('Error resolving reverse:', error);
      return null;
    }
  }
}

// Export singleton instance
export const defaultResolver = new DomainResolver();

// Helper functions
export async function resolveDomain(domain: string): Promise<Address | null> {
  return defaultResolver.resolve(domain);
}

export async function resolveDomainWithProfile(domain: string): Promise<ResolvedDomain | null> {
  return defaultResolver.resolveWithProfile(domain);
}
