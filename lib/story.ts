/**
 * Story Protocol Client Configuration
 * Provides utilities for interacting with Story Protocol blockchain
 */

import { StoryClient, StoryConfig } from '@story-protocol/core-sdk';
import { http, Address, Account } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

/**
 * Story Protocol chain configuration
 */
export const STORY_CHAIN_ID = parseInt(
  process.env.NEXT_PUBLIC_STORY_CHAIN_ID || '1315'
);

export const STORY_RPC_URL =
  process.env.NEXT_PUBLIC_STORY_RPC_URL || 'https://aeneid.storyrpc.io';

export const STORY_NETWORK =
  process.env.NEXT_PUBLIC_STORY_NETWORK || 'aeneid';

/**
 * Create Story Protocol client with private key (server-side only)
 * @param privateKey - Ethereum private key
 * @returns StoryClient instance
 */
export function createStoryClient(privateKey: `0x${string}`): StoryClient {
  const account: Account = privateKeyToAccount(privateKey);

  const config: StoryConfig = {
    account: account,
    transport: http(STORY_RPC_URL),
    chainId: 'aeneid',
  };

  return StoryClient.newClient(config);
}

/**
 * Create Story Protocol client with wallet account (client-side)
 * This is used when users connect their wallet via MetaMask/WalletConnect
 * @param account - Viem account from connected wallet
 * @returns StoryClient instance
 */
export function createStoryClientWithWallet(account: Account): StoryClient {
  const config: StoryConfig = {
    account: account,
    transport: http(STORY_RPC_URL),
    chainId: 'aeneid',
  };

  return StoryClient.newClient(config);
}

/**
 * Story Protocol helper functions
 */
export const storyHelpers = {
  /**
   * Format IP Asset ID for display
   * @param ipId - Story Protocol IP Asset ID
   * @returns Shortened IP ID
   */
  formatIpId: (ipId: string): string => {
    if (!ipId) return '';
    return `${ipId.slice(0, 6)}...${ipId.slice(-4)}`;
  },

  /**
   * Get Story Protocol explorer URL for an IP asset
   * @param ipId - Story Protocol IP Asset ID
   * @returns Explorer URL
   */
  getExplorerUrl: (ipId: string): string => {
    const baseUrl =
      STORY_NETWORK === 'mainnet'
        ? 'https://explorer.story.foundation'
        : 'https://aeneid-explorer.story.foundation';
    return `${baseUrl}/ipa/${ipId}`;
  },

  /**
   * Get transaction explorer URL
   * @param txHash - Transaction hash
   * @returns Explorer URL
   */
  getTxExplorerUrl: (txHash: string): string => {
    const baseUrl =
      STORY_NETWORK === 'mainnet'
        ? 'https://explorer.story.foundation'
        : 'https://aeneid-explorer.story.foundation';
    return `${baseUrl}/tx/${txHash}`;
  },

  /**
   * Check if address is valid Ethereum address
   * @param address - Ethereum address
   * @returns boolean
   */
  isValidAddress: (address: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  },

  /**
   * Check if IP ID is valid (same format as address)
   * @param ipId - Story Protocol IP Asset ID
   * @returns boolean
   */
  isValidIpId: (ipId: string): boolean => {
    return /^0x[a-fA-F0-9]{40}$/.test(ipId);
  },
};

/**
 * License term presets for common use cases
 */
export const LICENSE_PRESETS = {
  // Open license - allows derivatives and commercial use
  OPEN: {
    allowDerivatives: true,
    commercialUse: true,
    royaltyPercentage: 0,
  },

  // Remix license - allows derivatives but not commercial use
  REMIX: {
    allowDerivatives: true,
    commercialUse: false,
    royaltyPercentage: 0,
  },

  // Commercial license - allows commercial use with royalties
  COMMERCIAL: {
    allowDerivatives: true,
    commercialUse: true,
    royaltyPercentage: 10, // 10% royalty
  },

  // Restricted - no derivatives, no commercial use
  RESTRICTED: {
    allowDerivatives: false,
    commercialUse: false,
    royaltyPercentage: 0,
  },
};

/**
 * Error messages for Story Protocol operations
 */
export const STORY_ERRORS = {
  NO_WALLET: 'Please connect your wallet to continue',
  INVALID_NETWORK: 'Please switch to Story Protocol Aeneid Testnet',
  REGISTRATION_FAILED: 'Failed to register IP asset on Story Protocol',
  LICENSE_FAILED: 'Failed to attach license terms',
  DERIVATIVE_FAILED: 'Failed to register derivative',
  CLAIM_FAILED: 'Failed to claim royalties',
  INSUFFICIENT_FUNDS: 'Insufficient funds for transaction',
  USER_REJECTED: 'Transaction was rejected by user',
};

export default {
  createStoryClient,
  createStoryClientWithWallet,
  storyHelpers,
  LICENSE_PRESETS,
  STORY_ERRORS,
  STORY_CHAIN_ID,
  STORY_RPC_URL,
  STORY_NETWORK,
};
