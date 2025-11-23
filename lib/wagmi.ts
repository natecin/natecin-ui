import { http, createConfig } from 'wagmi';
import { injected } from 'wagmi/connectors';
import { defineChain } from 'viem';

// Define Lisk Sepolia chain
export const liskSepolia = defineChain({
  id: 4202,
  name: 'Lisk Sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Sepolia Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.sepolia-api.lisk.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Blockscout',
      url: 'https://sepolia-blockscout.lisk.com',
    },
  },
  testnet: true,
});

// MetaMask-specific connector to avoid conflicts with Coinbase/other wallets
const metaMaskConnector = injected({
  target: 'metaMask',
});

// Lisk Sepolia only configuration
export const config = createConfig({
  chains: [liskSepolia],
  connectors: [
    metaMaskConnector,
  ],
  transports: {
    [liskSepolia.id]: http(),
  },
});
