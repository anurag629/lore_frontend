/**
 * Wagmi configuration for Web3 wallet connections
 */
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// WalletConnect Project ID (you should get this from https://cloud.walletconnect.com/)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'demo-project-id'

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    injected(),
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Lore',
        description: 'Create, Remix, and Earn Forever',
        url: 'http://localhost:3001',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      }
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
