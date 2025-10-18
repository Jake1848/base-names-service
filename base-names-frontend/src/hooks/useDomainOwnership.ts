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

  useEffect(() => {
    async function fetchUserDomains() {
      if (!address || !publicClient) {
        setDomains([]);
        setLoading(false);
        return;
      }

      setLoading(true);

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

            // Get domain label - try multiple methods
            let name = ''; // Will be set below

            // Method 1: Try LabelSet events (V2 registrar with setLabel called)
            try {
              const labelSetLogs = await publicClient.getLogs({
                address: registrarAddress,
                event: {
                  type: 'event',
                  name: 'LabelSet',
                  inputs: [
                    { type: 'uint256', indexed: true, name: 'tokenId' },
                    { type: 'string', indexed: false, name: 'label' }
                  ]
                },
                args: {
                  tokenId: tokenId
                },
                fromBlock,
                toBlock: currentBlock
              });

              if (labelSetLogs && labelSetLogs.length > 0) {
                const latestLog = labelSetLogs[labelSetLogs.length - 1];
                const label = latestLog.args.label as string;
                if (label && label.length > 0) {
                  name = label;
                }
              }
            } catch {
              // LabelSet events might not exist, continue to next method
            }

            // Method 2: Check localStorage for user-registered domains
            if (!name) {
              try {
                const storedDomains = localStorage.getItem('registered-domains');
                if (storedDomains) {
                  const domains = JSON.parse(storedDomains) as Record<string, string>;
                  if (domains[tokenId.toString()]) {
                    name = domains[tokenId.toString()];
                  }
                }
              } catch {
                // localStorage might not be available
              }
            }

            // Method 3: Known mainnet domains (for demo purposes)
            if (!name && chainId === 8453) {
              const knownMainnetDomains: Record<string, string> = {
                '60441324523346820468025180184555417128388646322515874609861605923967042473548': 'demo123test',
                '109325344629264984051074050030278327149827846424650142590004363887305530273184': 'jake'
              };
              name = knownMainnetDomains[tokenId.toString()] || '';
            }

            // Method 4: Fallback to shortened tokenId
            if (!name) {
              name = `domain-${tokenId.toString().slice(0, 8)}`;
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
      } finally {
        setLoading(false);
      }
    }

    fetchUserDomains();
  }, [address, publicClient, chainId]);

  return { domains, loading };
}
