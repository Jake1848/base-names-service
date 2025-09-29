import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'wagmi';

// Custom RPC endpoints to avoid rate limiting
const baseMainnet = {
  ...base,
  rpcUrls: {
    default: {
      http: [
        'https://base.publicnode.com',
        'https://base-rpc.publicnode.com',
        'https://mainnet.base.org',
      ],
    },
    public: {
      http: [
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
    [base.id]: http('https://base.publicnode.com'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});