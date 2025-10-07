import { useEffect, useState } from 'react';
import { usePublicClient, useAccount } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { Address } from 'viem';

export interface OwnedDomain {
  tokenId: bigint;
  name: string;
  owner: Address;
  expires: bigint;
  registeredAt: bigint;
  isExpiringSoon: boolean;
  daysUntilExpiry: number;
}

export function useDomainOwnership() {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const [domains, setDomains] = useState<OwnedDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchUserDomains() {
      if (!address || !publicClient) {
        setDomains([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Get contracts for current chain
        const contracts = chainId === 8453
          ? CONTRACTS.BASE_MAINNET.contracts
          : CONTRACTS.BASE_SEPOLIA.contracts;
        const registrarAddress = contracts.BaseRegistrar as Address;

        // Fetch Transfer events where the 'to' address is the user
        // This gives us all domains transferred to this user
        const currentBlock = await publicClient.getBlockNumber();
        const fromBlock = currentBlock - BigInt(1000000); // Look back ~1M blocks (~1 month on Base)

        const transferLogs = await publicClient.getLogs({
          address: registrarAddress,
          event: {
            type: 'event',
            name: 'Transfer',
            inputs: [
              { type: 'address', indexed: true, name: 'from' },
              { type: 'address', indexed: true, name: 'to' },
              { type: 'uint256', indexed: true, name: 'tokenId' }
            ]
          },
          args: {
            to: address
          },
          fromBlock,
          toBlock: currentBlock
        });

        // Get unique token IDs
        const tokenIds = [...new Set(transferLogs.map(log => log.args.tokenId))].filter(
          (id): id is bigint => id !== undefined
        );

        // For each token, verify current ownership and get expiry
        const domainPromises = tokenIds.map(async (tokenId) => {
          try {
            // Check current owner
            const currentOwner = await publicClient.readContract({
              address: registrarAddress,
              abi: ABIS.BaseRegistrar,
              functionName: 'ownerOf',
              args: [tokenId]
            }) as Address;

            // Skip if no longer owned by user
            if (currentOwner.toLowerCase() !== address.toLowerCase()) {
              return null;
            }

            // Get expiry time
            const expires = await publicClient.readContract({
              address: registrarAddress,
              abi: ABIS.BaseRegistrar,
              functionName: 'nameExpires',
              args: [tokenId]
            }) as bigint;

            // Get domain label from V2 registrar
            let name = `domain-${tokenId.toString().slice(0, 8)}`; // Fallback
            try {
              const label = await publicClient.readContract({
                address: registrarAddress,
                abi: ABIS.BaseRegistrar,
                functionName: 'labels',
                args: [tokenId]
              }) as string;
              if (label && label.length > 0) {
                name = label;
              }
            } catch (err) {
              console.log(`Could not fetch label for ${tokenId}, using fallback`);
            }

            // Get registration event for this token
            const registrationLogs = await publicClient.getLogs({
              address: registrarAddress,
              event: {
                type: 'event',
                name: 'Transfer',
                inputs: [
                  { type: 'address', indexed: true, name: 'from' },
                  { type: 'address', indexed: true, name: 'to' },
                  { type: 'uint256', indexed: true, name: 'tokenId' }
                ]
              },
              args: {
                tokenId
              },
              fromBlock,
              toBlock: currentBlock
            });

            const firstTransfer = registrationLogs[0];
            const registeredAt = firstTransfer?.blockNumber || BigInt(0);

            // Calculate days until expiry
            const now = BigInt(Math.floor(Date.now() / 1000));
            const daysUntilExpiry = Number(expires > now ? (expires - now) / BigInt(86400) : BigInt(0));
            const isExpiringSoon = daysUntilExpiry > 0 && daysUntilExpiry <= 30;

            return {
              tokenId,
              name,
              owner: currentOwner,
              expires,
              registeredAt,
              isExpiringSoon,
              daysUntilExpiry
            };
          } catch (err) {
            console.error(`Error fetching domain ${tokenId}:`, err);
            return null;
          }
        });

        const domainsData = await Promise.all(domainPromises);
        const validDomains = domainsData.filter((d): d is OwnedDomain => d !== null);

        setDomains(validDomains);
      } catch (err) {
        console.error('Error fetching user domains:', err);
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchUserDomains();
  }, [address, publicClient]);

  return { domains, loading, error };
}
