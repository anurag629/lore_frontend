/**
 * Authentication hook for SIWE (Sign-In with Ethereum)
 */
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAccount, useSignMessage, useDisconnect } from 'wagmi';
import { authAPI, tokenManager } from '@/lib/api';

export interface User {
  id: number;
  wallet_address: string;
  username: string | null;
  email: string;
  bio: string;
  avatar_url: string;
  total_earnings: string;
  assets_count: number;
  total_spinoffs: number;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export function useAuth() {
  const { address, isConnected } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { disconnect } = useDisconnect();

  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Initialize auth state from localStorage
  useEffect(() => {
    const initAuth = () => {
      const user = tokenManager.getUser();
      const token = tokenManager.getAccessToken();

      if (user && token) {
        setAuthState({
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
      } else {
        setAuthState({
          user: null,
          isAuthenticated: false,
          isLoading: false,
          error: null,
        });
      }
    };

    initAuth();

    // Listen for logout events from token refresh failure
    const handleLogout = () => {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Session expired. Please sign in again.',
      });
    };

    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  // Login with SIWE
  const login = useCallback(async () => {
    if (!address || !isConnected) {
      setAuthState((prev) => ({
        ...prev,
        error: 'Please connect your wallet first',
      }));
      return;
    }

    setAuthState((prev) => ({
      ...prev,
      isLoading: true,
      error: null,
    }));

    try {
      // Step 1: Get nonce from backend
      const { nonce, message } = await authAPI.getNonce(address);

      // Step 2: Sign the message with wallet
      const signature = await signMessageAsync({
        message,
      });

      // Step 3: Send signature to backend for verification
      const data = await authAPI.login(message, signature);

      // Step 4: Update auth state
      setAuthState({
        user: data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return data;
    } catch (error: any) {
      console.error('Login error:', error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.signature?.[0] ||
        error.message ||
        'Failed to sign in. Please try again.';

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: errorMessage,
      });

      throw error;
    }
  }, [address, isConnected, signMessageAsync]);

  // Logout
  const logout = useCallback(async () => {
    setAuthState((prev) => ({
      ...prev,
      isLoading: true,
    }));

    try {
      await authAPI.logout();
      disconnect();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      console.error('Logout error:', error);

      // Even if backend logout fails, clear local state
      tokenManager.clearTokens();
      disconnect();

      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  }, [disconnect]);

  // Refresh user data
  const refreshUser = useCallback(async () => {
    if (!authState.isAuthenticated) return;

    try {
      const user = await authAPI.getCurrentUser();
      setAuthState((prev) => ({
        ...prev,
        user,
      }));
      return user;
    } catch (error) {
      console.error('Failed to refresh user:', error);
      throw error;
    }
  }, [authState.isAuthenticated]);

  // Update profile
  const updateProfile = useCallback(
    async (data: Partial<User>) => {
      if (!authState.isAuthenticated) {
        throw new Error('Not authenticated');
      }

      try {
        const updatedUser = await authAPI.updateProfile(data);
        setAuthState((prev) => ({
          ...prev,
          user: updatedUser,
        }));
        return updatedUser;
      } catch (error) {
        console.error('Failed to update profile:', error);
        throw error;
      }
    },
    [authState.isAuthenticated]
  );

  return {
    // State
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,

    // Wallet state
    address,
    isWalletConnected: isConnected,

    // Actions
    login,
    logout,
    refreshUser,
    updateProfile,
  };
}
