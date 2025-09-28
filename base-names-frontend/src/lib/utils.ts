import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string, length = 4) {
  return `${address.slice(0, length + 2)}...${address.slice(-length)}`
}

export function formatPrice(wei: bigint, decimals = 18) {
  const eth = Number(wei) / Math.pow(10, decimals)
  return eth.toFixed(3)
}

export function formatDate(timestamp: number) {
  return new Date(timestamp * 1000).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function getDaysUntilExpiry(expiryTimestamp: number) {
  const now = Date.now() / 1000
  const daysLeft = Math.ceil((expiryTimestamp - now) / (24 * 60 * 60))
  return Math.max(0, daysLeft)
}