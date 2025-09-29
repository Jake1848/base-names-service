import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
import { http } from 'wagmi';

// Custom RPC endpoints with Infura for better reliability
const baseMainnet = {
  ...base,
  rpcUrls: {
    default: {
      http: [
        'https://base-mainnet.infura.io/v3/9cf038d5acc346f481e94ec4550a888c',
        'https://base.publicnode.com',
        'https://base-rpc.publicnode.com',
        'https://mainnet.base.org',
      ],
    },
    public: {
      http: [
        'https://base-mainnet.infura.io/v3/9cf038d5acc346f481e94ec4550a888c',
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
    [base.id]: http('https://base-mainnet.infura.io/v3/9cf038d5acc346f481e94ec4550a888c'),
    [baseSepolia.id]: http('https://sepolia.base.org'),
  },
  ssr: true,
});