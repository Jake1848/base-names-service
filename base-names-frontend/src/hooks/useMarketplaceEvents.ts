import { useEffect, useState } from 'react';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { CONTRACTS, ABIS } from '@/lib/contracts';
import { toast } from 'sonner';

export interface MarketplaceEvent {
  type: 'listed' | 'sold' | 'cancelled';
  tokenId: bigint;
  seller?: string;
  buyer?: string;
  price?: bigint;
  timestamp: number;
}

export function useMarketplaceEvents() {
  const { chainId } = useAccount();
  const [events, setEvents] = useState<MarketplaceEvent[]>([]);

  const contracts = chainId === 8453
    ? CONTRACTS.BASE_MAINNET.contracts
    : CONTRACTS.BASE_SEPOLIA.contracts;

  // Watch for Listed events
  useWatchContractEvent({
    address: contracts.DomainMarketplace as `0x${string}`,
    abi: [
      {
        name: 'Listed',
        type: 'event',
        inputs: [
          { name: 'tokenId', type: 'uint256', indexed: true },
          { name: 'seller', type: 'address', indexed: true },
          { name: 'price', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    ],
    eventName: 'Listed',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { tokenId, seller, price, timestamp } = log.args;

        const newEvent: MarketplaceEvent = {
          type: 'listed',
          tokenId,
          seller,
          price,
          timestamp: Number(timestamp)
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 50)); // Keep last 50 events

        toast.info('New domain listed!', {
          description: `TokenID ${tokenId.toString().slice(0, 8)}... for ${(Number(price) / 1e18).toFixed(3)} ETH`
        });
      });
    }
  });

  // Watch for Sold events
  useWatchContractEvent({
    address: contracts.DomainMarketplace as `0x${string}`,
    abi: [
      {
        name: 'Sold',
        type: 'event',
        inputs: [
          { name: 'tokenId', type: 'uint256', indexed: true },
          { name: 'seller', type: 'address', indexed: true },
          { name: 'buyer', type: 'address', indexed: true },
          { name: 'price', type: 'uint256' },
          { name: 'fee', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    ],
    eventName: 'Sold',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { tokenId, seller, buyer, price, timestamp } = log.args;

        const newEvent: MarketplaceEvent = {
          type: 'sold',
          tokenId,
          seller,
          buyer,
          price,
          timestamp: Number(timestamp)
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 50));

        toast.success('Domain sold!', {
          description: `TokenID ${tokenId.toString().slice(0, 8)}... sold for ${(Number(price) / 1e18).toFixed(3)} ETH`
        });
      });
    }
  });

  // Watch for ListingCancelled events
  useWatchContractEvent({
    address: contracts.DomainMarketplace as `0x${string}`,
    abi: [
      {
        name: 'ListingCancelled',
        type: 'event',
        inputs: [
          { name: 'tokenId', type: 'uint256', indexed: true },
          { name: 'seller', type: 'address', indexed: true },
          { name: 'timestamp', type: 'uint256' }
        ]
      }
    ],
    eventName: 'ListingCancelled',
    onLogs(logs) {
      logs.forEach((log: any) => {
        const { tokenId, seller, timestamp } = log.args;

        const newEvent: MarketplaceEvent = {
          type: 'cancelled',
          tokenId,
          seller,
          timestamp: Number(timestamp)
        };

        setEvents(prev => [newEvent, ...prev].slice(0, 50));

        toast.info('Listing cancelled', {
          description: `TokenID ${tokenId.toString().slice(0, 8)}...`
        });
      });
    }
  });

  return {
    events,
    recentSales: events.filter(e => e.type === 'sold').slice(0, 10),
    recentListings: events.filter(e => e.type === 'listed').slice(0, 10),
  };
}
