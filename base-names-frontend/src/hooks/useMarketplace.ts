import { useWriteContract, useReadContract, useAccount } from 'wagmi';
import { parseEther } from 'viem';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { toast } from 'sonner';

export function useMarketplace() {
  const { chainId } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const contracts = chainId === 8453
    ? CONTRACTS.BASE_MAINNET.contracts
    : CONTRACTS.BASE_SEPOLIA.contracts;

  // List a domain for sale
  const listDomain = async (tokenId: bigint, priceInEth: string) => {
    try {
      const hash = await writeContractAsync({
        address: contracts.DomainMarketplace as `0x${string}`,
        abi: ABIS.DomainMarketplace,
        functionName: 'createListing',
        args: [tokenId, parseEther(priceInEth)],
      });

      toast.success('Domain listed successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });

      return hash;
    } catch (error) {
      console.error('List domain error:', error);
      const message = error instanceof Error ? error.message : 'Please try again';
      toast.error('Failed to list domain', {
        description: message,
      });
      throw error;
    }
  };

  // Buy a listed domain
  const buyDomain = async (tokenId: bigint, priceInEth: string) => {
    try {
      const hash = await writeContractAsync({
        address: contracts.DomainMarketplace as `0x${string}`,
        abi: ABIS.DomainMarketplace,
        functionName: 'buyListing',
        args: [tokenId],
        value: parseEther(priceInEth),
      });

      toast.success('Domain purchased successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });

      return hash;
    } catch (error) {
      console.error('Buy domain error:', error);
      const message = error instanceof Error ? error.message : 'Please try again';
      toast.error('Failed to purchase domain', {
        description: message,
      });
      throw error;
    }
  };

  // Cancel a listing
  const cancelListing = async (tokenId: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: contracts.DomainMarketplace as `0x${string}`,
        abi: ABIS.DomainMarketplace,
        functionName: 'cancelListing',
        args: [tokenId],
      });

      toast.success('Listing cancelled successfully!', {
        description: `Transaction: ${hash.slice(0, 10)}...`,
      });

      return hash;
    } catch (error) {
      console.error('Cancel listing error:', error);
      const message = error instanceof Error ? error.message : 'Please try again';
      toast.error('Failed to cancel listing', {
        description: message,
      });
      throw error;
    }
  };

  // Approve marketplace to transfer NFT
  const approveMarketplace = async (tokenId: bigint) => {
    try {
      const hash = await writeContractAsync({
        address: contracts.BaseRegistrar as `0x${string}`,
        abi: [
          {
            name: 'approve',
            type: 'function',
            stateMutability: 'nonpayable',
            inputs: [
              { name: 'to', type: 'address' },
              { name: 'tokenId', type: 'uint256' }
            ],
            outputs: []
          }
        ],
        functionName: 'approve',
        args: [contracts.DomainMarketplace as `0x${string}`, tokenId],
      });

      toast.success('Marketplace approved!', {
        description: 'Now you can list your domain',
      });

      return hash;
    } catch (error) {
      console.error('Approve error:', error);
      const message = error instanceof Error ? error.message : 'Please try again';
      toast.error('Failed to approve marketplace', {
        description: message,
      });
      throw error;
    }
  };

  return {
    listDomain,
    buyDomain,
    cancelListing,
    approveMarketplace,
  };
}

// Hook to check if domain is listed
export function useDomainListing(tokenId: bigint | undefined) {
  const { chainId } = useAccount();

  const contracts = chainId === 8453
    ? CONTRACTS.BASE_MAINNET.contracts
    : CONTRACTS.BASE_SEPOLIA.contracts;

  const { data, isLoading, refetch } = useReadContract({
    address: contracts.DomainMarketplace as `0x${string}`,
    abi: ABIS.DomainMarketplace,
    functionName: 'getListing',
    args: tokenId ? [tokenId] : undefined,
    query: {
      enabled: !!tokenId,
    },
  });

  if (!data) {
    return {
      isListed: false,
      seller: undefined,
      price: undefined,
      createdAt: undefined,
      refetch,
      isLoading,
    };
  }

  const [seller, price, createdAt, active] = data as [string, bigint, bigint, boolean];

  return {
    isListed: active,
    seller,
    price,
    createdAt,
    refetch,
    isLoading,
  };
}
