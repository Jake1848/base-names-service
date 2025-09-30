import { useReadContract, useReadContracts } from 'wagmi';
import { CONTRACTS, ABIS, PREMIUM_DOMAINS, labelHash } from './contracts';
import { useEffect, useState } from 'react';

// Hook to get real-time domain registration data
export function useRegistrationStats() {
  const [stats, setStats] = useState({
    totalRegistered: 0,
    totalRevenue: 0,
    registrationsByCategory: {} as Record<string, number>,
    recentRegistrations: [] as any[],
  });

  // Check registration status for all premium domains
  const domainChecks = PREMIUM_DOMAINS.map(domain => ({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [labelHash(domain)],
  }));

  const { data: availabilityData } = useReadContracts({
    contracts: domainChecks,
  });

  useEffect(() => {
    if (!availabilityData) return;

    let totalRegistered = 0;
    let totalRevenue = 0;
    const registrationsByCategory: Record<string, number> = {};

    PREMIUM_DOMAINS.forEach((domain, index) => {
      const isAvailable = availabilityData[index]?.result;
      if (isAvailable === false) { // Domain is registered
        totalRegistered++;
        totalRevenue += 0.05; // Assuming 0.05 ETH per domain

        // Categorize domain (simplified categorization)
        let category = 'other';
        if (['btc', 'eth', 'crypto', 'defi', 'nft'].includes(domain)) category = 'crypto';
        else if (['coinbase', 'base', 'opensea'].includes(domain)) category = 'brands';
        else if (['web3', 'dao', 'dapp'].includes(domain)) category = 'web3';
        else if (['john', 'alice', 'bob'].includes(domain)) category = 'names';

        registrationsByCategory[category] = (registrationsByCategory[category] || 0) + 1;
      }
    });

    setStats({
      totalRegistered,
      totalRevenue,
      registrationsByCategory,
      recentRegistrations: [], // This would need event listening
    });
  }, [availabilityData]);

  return stats;
}

// Hook to get real marketplace data
export function useMarketplaceData() {
  const [marketplaceData, setMarketplaceData] = useState({
    listedDomains: [] as any[],
    floorPrice: 0.01,
    totalVolume: 0,
    totalSales: 0,
  });

  // For now, we'll return static data since we don't have a marketplace contract
  // In a real implementation, this would query marketplace contract events
  useEffect(() => {
    setMarketplaceData({
      listedDomains: [],
      floorPrice: 0.01,
      totalVolume: 5.1, // This would come from marketplace events
      totalSales: 25,
    });
  }, []);

  return marketplaceData;
}

// Hook to get domain ownership data
export function useDomainOwnership(domain: string) {
  const tokenId = labelHash(domain);

  const { data: owner } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'ownerOf',
    args: [tokenId],
  });

  const { data: isAvailable } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseRegistrar as `0x${string}`,
    abi: ABIS.BaseRegistrar,
    functionName: 'available',
    args: [tokenId],
  });

  return {
    owner: owner as string | undefined,
    isAvailable: isAvailable as boolean | undefined,
    isRegistered: isAvailable === false,
  };
}

// Hook to track registration events (would need event listening setup)
export function useRegistrationEvents() {
  const [events, setEvents] = useState([]);

  // This would use wagmi's useWatchContractEvent to listen for Registration events
  // For now, return empty array
  return events;
}

// Real-time price data (would connect to price oracle)
export function useDomainPricing() {
  const { data: rentPrice } = useReadContract({
    address: CONTRACTS.BASE_MAINNET.contracts.BaseController as `0x${string}`,
    abi: ABIS.BaseController,
    functionName: 'rentPrice',
    args: ['test', BigInt(365 * 24 * 60 * 60)], // 1 year
  });

  return {
    basePrice: rentPrice ? Number(rentPrice) / 1e18 : 0.05,
    premiumPrice: 0.1,
    rarePrice: 0.05,
  };
}