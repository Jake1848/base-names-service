import { useEffect, useState } from 'react';
import { usePublicClient } from 'wagmi';
import { keccak256, toHex, Address } from 'viem';

// Helper to convert domain name to token ID
export function labelHash(label: string): bigint {
  return BigInt(keccak256(toHex(label)));
}

export interface DomainRegistration {
  name: string;
  tokenId: bigint;
  owner: Address;
  registeredAt: bigint;
  expiresAt: bigint;
  blockNumber: bigint;
}

/**
 * Hook to fetch all domain registrations by monitoring NameRegistered events
 * This builds a registry of domain name -> tokenId mappings
 */
export function useDomainRegistry() {
  const publicClient = usePublicClient();
  const [registry, setRegistry] = useState<Map<string, DomainRegistration>>(new Map());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function buildRegistry() {
      if (!publicClient) {
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        // const controllerAddress = CONTRACTS.BASE_MAINNET.contracts.BaseController as Address;

        // Get current block
        // const currentBlock = await publicClient.getBlockNumber();

        // Look back a reasonable amount (adjust based on network)
        // const fromBlock = currentBlock - BigInt(100000); // ~100k blocks

        // Fetch NameRegistered events
        // Note: The actual event signature depends on your controller contract
        // This is a placeholder - you'll need to add the actual ABI event
        // const logs = await publicClient.getLogs({
        //   address: controllerAddress,
        //   fromBlock,
        //   toBlock: currentBlock,
        //   Would need actual NameRegistered event signature here
        // });

        const newRegistry = new Map<string, DomainRegistration>();

        // Process logs and build registry
        // This is simplified - actual implementation depends on event structure
        // for (const log of logs) {
        //   Extract domain name, tokenId, owner, etc from log
        //   Add to registry
        // }

        setRegistry(newRegistry);
      } catch (err) {
        console.error('Error building domain registry:', err);
      } finally {
        setLoading(false);
      }
    }

    buildRegistry();
  }, [publicClient]);

  // Helper function to get domain info by name
  const getDomainByName = (name: string): DomainRegistration | undefined => {
    return registry.get(name.toLowerCase());
  };

  // Helper function to get domain info by tokenId
  const getDomainByTokenId = (tokenId: bigint): DomainRegistration | undefined => {
    for (const domain of registry.values()) {
      if (domain.tokenId === tokenId) {
        return domain;
      }
    }
    return undefined;
  };

  return {
    registry,
    loading,
    getDomainByName,
    getDomainByTokenId,
    labelHash
  };
}
