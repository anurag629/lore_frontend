'use client';

import { useState, useEffect } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { Wallet, LogOut, Loader2, User } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';

export default function WalletConnect() {
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, user, login, logout, isLoading, error } = useAuth();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);

  // Auto-login when wallet connects
  useEffect(() => {
    const handleAutoLogin = async () => {
      if (isConnected && address && !isAuthenticated && !isLoading) {
        setIsSigning(true);
        try {
          await login();
        } catch (error) {
          console.error('Auto-login failed:', error);
        } finally {
          setIsSigning(false);
        }
      }
    };

    handleAutoLogin();
  }, [isConnected, address, isAuthenticated, isLoading, login]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      // Use the first connector (usually injected/MetaMask)
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error('Connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    await logout();
    disconnect();
  };

  const handleSignIn = async () => {
    setIsSigning(true);
    try {
      await login();
    } catch (error) {
      console.error('Sign-in error:', error);
    } finally {
      setIsSigning(false);
    }
  };

  // Show loading state
  if (isConnecting || (isConnected && isSigning)) {
    return (
      <Button variant="secondary" disabled>
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>{isConnecting ? 'Connecting...' : 'Signing...'}</span>
      </Button>
    );
  }

  // Authenticated state
  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-3">
        {/* User info (desktop) */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
            <User className="w-4 h-4 text-white" />
          </div>
          <div className="text-sm">
            <div className="font-medium text-white">
              {user.username || `${user.wallet_address.slice(0, 6)}...${user.wallet_address.slice(-4)}`}
            </div>
            <div className="text-xs text-slate-400">
              {user.total_earnings} ETH earned
            </div>
          </div>
        </div>

        {/* Logout button */}
        <Button variant="outline" onClick={handleDisconnect} className="gap-2">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Disconnect</span>
        </Button>
      </div>
    );
  }

  // Wallet connected but not signed in
  if (isConnected && address) {
    return (
      <div className="flex flex-col gap-2">
        <Button variant="primary" onClick={handleSignIn} disabled={isSigning}>
          {isSigning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Signing...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span>Sign In</span>
            </>
          )}
        </Button>
        {error && (
          <p className="text-xs text-red-400 text-center max-w-xs">{error}</p>
        )}
      </div>
    );
  }

  // Not connected
  return (
    <Button variant="primary" onClick={handleConnect} disabled={isConnecting}>
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </Button>
  );
}
