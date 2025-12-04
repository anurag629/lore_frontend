'use client';

import { useState, useEffect, useRef } from 'react';
import { useConnect, useAccount, useDisconnect } from 'wagmi';
import { Wallet, LogOut, Loader2, User, ChevronDown, Copy, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';
import { useClipboard } from '@/hooks/useClipboard';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

export default function WalletConnect() {
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { isAuthenticated, user, login, logout, isLoading, error } = useAuth();
  const { copy } = useClipboard();
  const { showToast } = useToast();

  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isMenuOpen]);

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
      const connector = connectors[0];
      if (connector) {
        connect({ connector });
      }
    } catch (error) {
      console.error('Connection error:', error);
      showToast('Failed to connect wallet', 'error');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsMenuOpen(false);
    await logout();
    disconnect();
    showToast('Wallet disconnected', 'success');
  };

  const handleSignIn = async () => {
    setIsSigning(true);
    try {
      await login();
      showToast('Signed in successfully', 'success');
    } catch (error) {
      console.error('Sign-in error:', error);
      showToast('Failed to sign in', 'error');
    } finally {
      setIsSigning(false);
    }
  };

  const handleCopyAddress = async () => {
    if (address) {
      copy(address, 'Address');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return '';
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  // Prevent hydration mismatch - show loading until mounted
  if (!mounted) {
    return (
      <div className="h-10 w-32 flex items-center justify-center">
        <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
      </div>
    );
  }

  // Show loading state
  if (isConnecting || (isConnected && isSigning && !isAuthenticated)) {
    return (
      <div className="h-10 flex items-center">
        <button
          disabled
          className="px-4 py-2 rounded-lg bg-slate-900/80 border border-white/10 text-slate-400 flex items-center gap-2 cursor-not-allowed"
        >
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">{isConnecting ? 'Connecting...' : 'Signing...'}</span>
        </button>
      </div>
    );
  }

  // Authenticated state with dropdown menu
  if (isAuthenticated && user && address) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 group"
        >
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
            {user.avatar_url ? (
              <img
                src={user.avatar_url}
                alt={user.username || 'User'}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>

          {/* User info - Desktop only */}
          <div className="hidden md:block text-left">
            <div className="text-sm font-medium text-white leading-tight">
              {user.username || formatAddress(user.wallet_address)}
            </div>
            <div className="text-xs text-slate-400 leading-tight">
              {formatAddress(address)}
            </div>
          </div>

          {/* Chevron */}
          <ChevronDown className={cn(
            "w-4 h-4 text-slate-400 transition-transform duration-200 flex-shrink-0",
            isMenuOpen && "rotate-180"
          )} />
        </button>

        {/* Dropdown Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 top-full mt-2 w-64 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden z-50"
            >
              {/* User Info Section */}
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username || 'User'}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-6 h-6 text-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-white truncate">
                      {user.username || 'Unnamed User'}
                    </div>
                    <div className="text-xs text-slate-400 truncate font-mono">
                      {formatAddress(user.wallet_address)}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/5">
                  <div>
                    <div className="text-xs text-slate-400">Assets</div>
                    <div className="text-sm font-semibold text-white">{user.assets_count || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Earnings</div>
                    <div className="text-sm font-semibold text-amber-400">{user.total_earnings || '0.00'} ETH</div>
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="p-2">
                <Link
                  href={`/profile/${user.wallet_address}`}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  <User className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                  <span className="text-sm text-slate-300 group-hover:text-white">View Profile</span>
                  <ExternalLink className="w-3 h-3 text-slate-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>

                <button
                  onClick={handleCopyAddress}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-colors group"
                >
                  {copied ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-400 group-hover:text-amber-400 transition-colors" />
                      <span className="text-sm text-slate-300 group-hover:text-white">Copy Address</span>
                    </>
                  )}
                </button>

                <div className="h-px bg-white/10 my-1" />

                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-colors group text-red-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm font-medium">Disconnect</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Wallet connected but not signed in
  if (isConnected && address) {
    return (
      <div className="h-10 flex items-center">
        <button
          onClick={handleSignIn}
          disabled={isSigning}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSigning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm font-medium">Signing...</span>
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              <span className="text-sm font-medium">Sign In</span>
            </>
          )}
        </button>
        {error && (
          <div className="ml-2 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
            <p className="text-xs text-red-400 max-w-[200px] truncate">
              {typeof error === 'string' ? error : 'Sign in failed'}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Not connected
  return (
    <div className="h-10 flex items-center">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-600 text-white hover:from-amber-600 hover:to-orange-700 transition-all duration-200 flex items-center gap-2 shadow-lg shadow-amber-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Wallet className="w-4 h-4" />
        <span className="text-sm font-medium">Connect Wallet</span>
      </button>
    </div>
  );
}
