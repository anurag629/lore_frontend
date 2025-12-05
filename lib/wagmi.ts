/**
 * Wagmi configuration for Web3 wallet connections
 */
import { http, createConfig } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { injected, walletConnect } from 'wagmi/connectors'

// WalletConnect Project ID (you should get this from https://cloud.reown.com/)
// If not set, WalletConnect features will be disabled (injected wallets still work)
const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

// App URL for WalletConnect metadata (use env var or default to localhost:3000)
const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// Build connectors array - always include injected, conditionally include WalletConnect
const connectors: any[] = [injected()]

// Only add WalletConnect connector if project ID is valid
// Valid project IDs are UUIDs (36 chars with dashes) or at least 20 chars
if (projectId && projectId.length >= 20 && projectId !== 'your-project-id-here' && projectId !== 'demo-project-id') {
  connectors.push(
    walletConnect({
      projectId,
      showQrModal: true,
      metadata: {
        name: 'Lore',
        description: 'Create, Remix, and Earn Forever',
        url: appUrl,
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      }
    })
  )
} else if (typeof window !== 'undefined') {
  // Only log warning in browser (not during SSR)
  console.warn(
    'WalletConnect Project ID not configured. ' +
    'WalletConnect features disabled. ' +
    'Get a free project ID at https://cloud.reown.com and set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID in .env.local'
  )
}

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors,
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
})
