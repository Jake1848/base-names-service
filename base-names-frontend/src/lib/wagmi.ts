import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'wagmi';

// Get Infura API key from environment variable
const infuraApiKey = process.env.NEXT_PUBLIC_INFURA_API_KEY;

// Build Infura URL if API key is available
const infuraUrl = infuraApiKey
  ? `https://base-mainnet.infura.io/v3/${infuraApiKey}`
  : null;

// Custom RPC endpoints with Infura for better reliability
const baseMainnet = {
  ...base,
  rpcUrls: {
    default: {
      http: [
        ...(infuraUrl ? [infuraUrl] : []),
        'https://base.publicnode.com',
        'https://base-rpc.publicnode.com',
        'https://mainnet.base.org',
      ],
    },
    public: {
      http: [
        ...(infuraUrl ? [infuraUrl] : []),
        'https://base.publicnode.com',
        'https://base-rpc.publicnode.com',
        'https://mainnet.base.org',
      ],
    },
  },
};

export const config = getDefaultConfig({
  appName: 'Base Names - Decentralized Domains on Base L2',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id',
  chains: [baseMainnet, baseSepolia],
  transports: {
    [base.id]: http(infuraUrl || 'https://mainnet.base.org'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});