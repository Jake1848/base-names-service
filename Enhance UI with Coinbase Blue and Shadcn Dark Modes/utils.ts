import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format Ethereum address to show first 6 and last 4 characters
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Format price from wei to ETH
export function formatPrice(priceWei: bigint): string {
  const eth = Number(priceWei) / 1e18;
  return eth.toFixed(4);
}

// Format timestamp to readable date
export function formatDate(timestamp: number): string {
  return new Date(timestamp * 1000).toLocaleDateString();
}

// Get days until expiry
export function getDaysUntilExpiry(expiryTimestamp: number): number {
  const now = Math.floor(Date.now() / 1000);
  const secondsUntilExpiry = expiryTimestamp - now;
  return Math.floor(secondsUntilExpiry / (24 * 60 * 60));
}
