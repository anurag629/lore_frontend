'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, BarChart3, User, Sparkles, Settings, Plus, FolderOpen, MoreHorizontal, Coins } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import MintModal from '@/components/mint/MintModal';
import WalletConnect from '@/components/auth/WalletConnect';
import { useKeyboardShortcutsContext } from '@/components/keyboard/KeyboardShortcutsProvider';

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Explore', href: '/explore', icon: Compass },
  { name: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  { name: 'Collections', href: '/collections', icon: FolderOpen },
  { name: 'Profile', href: '/profile', icon: User }, // Will redirect to /profile/[address]
];

export default function Sidebar() {
  const pathname = usePathname();
  const [localMintModalOpen, setLocalMintModalOpen] = useState(false);
  const [showMore, setShowMore] = useState(false);
  
  // Try to use keyboard shortcuts context if available, otherwise use local state
  let keyboardContext: ReturnType<typeof useKeyboardShortcutsContext> | null = null;
  try {
    keyboardContext = useKeyboardShortcutsContext();
  } catch {
    // Context not available, use local state
  }

  const isMintModalOpen = keyboardContext ? keyboardContext.isMintModalOpen : localMintModalOpen;

  const handleOpenMintModal = () => {
    if (keyboardContext) {
      keyboardContext.openMintModal();
    } else {
      setLocalMintModalOpen(true);
    }
  };

  const handleCloseMintModal = () => {
    if (keyboardContext) {
      keyboardContext.closeMintModal();
    } else {
      setLocalMintModalOpen(false);
    }
  };

  return (
    <>
      {/* MintModal is now rendered in KeyboardShortcutsProvider, but we keep local fallback */}
      {!keyboardContext && (
        <MintModal isOpen={isMintModalOpen} onClose={handleCloseMintModal} />
      )}

      {/* Desktop Dock (Left Side) */}
      <motion.aside
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex fixed left-4 top-1/2 -translate-y-1/2 z-50 flex-col gap-4"
      >
        <div className="glass p-3 rounded-2xl flex flex-col items-center gap-4 shadow-2xl shadow-black/50 border border-white/10 bg-slate-950/80 backdrop-blur-xl">
          {/* Logo */}
          {/* Logo */}
          <Link href="/" className="relative group p-2">
            <div className="absolute inset-0 bg-amber-600/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </Link>

          <div className="w-8 h-[1px] bg-white/10" />

          {/* Navigation */}
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              // Special handling for routes with dynamic segments
              let isActive = false;
              if (item.href === '/profile') {
                // Match /profile and /profile/[address]
                isActive = pathname === '/profile' || pathname.startsWith('/profile/');
              } else if (item.href === '/explore') {
                // Match /explore and /explore/[id]
                isActive = pathname === '/explore' || pathname.startsWith('/explore/');
              } else if (item.href === '/collections') {
                // Match /collections and /collections/[id]
                isActive = pathname === '/collections' || pathname.startsWith('/collections/');
              } else {
                // Exact match for other routes
                isActive = pathname === item.href;
              }

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className="relative group"
                >
                  {/* Tooltip */}
                  <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 top-1/2 -translate-y-1/2">
                    {item.name}
                  </div>

                  <div className={cn(
                    "p-3 rounded-xl transition-all duration-300 relative",
                    isActive 
                      ? "bg-white/10 text-white shadow-lg shadow-amber-500/10" 
                      : "text-slate-400 hover:text-white hover:bg-white/5 hover:scale-110"
                  )}>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-amber-500 rounded-r-full -ml-3.5" />
                    )}
                    <Icon className="w-5 h-5" />
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="w-8 h-[1px] bg-white/10" />

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleOpenMintModal}
              className="p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white hover:scale-110 transition-transform shadow-lg shadow-amber-500/20 group relative"
            >
              <div className="absolute left-full ml-4 px-2 py-1 bg-slate-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-white/10 top-1/2 -translate-y-1/2">
                Mint Entry
              </div>
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>
      </motion.aside>

      {/* Desktop Wallet Connect (Top Right) */}
      <div className="hidden lg:flex fixed right-8 top-8 z-50">
        <WalletConnect />
      </div>

      {/* Mobile Bottom Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 px-2 pb-2 pt-1 safe-area-inset-bottom">
        <div className="glass rounded-2xl px-1 py-1.5 flex items-center justify-between gap-0.5 shadow-2xl shadow-black/50 border border-white/10 bg-slate-950/90 backdrop-blur-xl w-full overflow-hidden">
          {navItems.map((item) => {
            const Icon = item.icon;
            // Special handling for routes with dynamic segments
            let isActive = false;
            if (item.href === '/profile') {
              // Match /profile and /profile/[address]
              isActive = pathname === '/profile' || pathname.startsWith('/profile/');
            } else if (item.href === '/explore') {
              // Match /explore and /explore/[id]
              isActive = pathname === '/explore' || pathname.startsWith('/explore/');
            } else if (item.href === '/collections') {
              // Match /collections and /collections/[id]
              isActive = pathname === '/collections' || pathname.startsWith('/collections/');
            } else {
              // Exact match for other routes
              isActive = pathname === item.href;
            }

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 rounded-lg transition-all duration-300 relative group flex-1 min-w-0 max-w-[20%]",
                  isActive 
                    ? "text-amber-400" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/20 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-4 h-4 sm:w-5 sm:h-5 relative z-10 transition-colors flex-shrink-0", isActive ? "text-amber-400" : "group-hover:text-amber-400")} />
                <span className="text-[9px] sm:text-[10px] font-medium relative z-10 truncate w-full text-center leading-tight px-0.5">{item.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleOpenMintModal}
            className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-slate-400 hover:text-white flex-shrink-0 max-w-[20%]"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium leading-tight">Mint</span>
          </button>

          <button
            onClick={() => setShowMore(!showMore)}
            className="flex flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-slate-400 hover:text-white flex-shrink-0 max-w-[20%]"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-slate-800 text-white border border-white/10">
              <MoreHorizontal className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <span className="text-[9px] sm:text-[10px] font-medium leading-tight">More</span>
          </button>
        </div>
      </div>

      {/* Mobile More sheet */}
      {showMore && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setShowMore(false)}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div
            className="absolute bottom-0 left-0 right-0 bg-slate-950 border-t border-white/10 rounded-t-2xl p-4 space-y-3 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <span className="text-slate-200 font-semibold">Shortcuts</span>
              <button
                className="text-slate-400 hover:text-white text-sm"
                onClick={() => setShowMore(false)}
              >
                Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <Link href="/groups" className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50" onClick={() => setShowMore(false)}>
                Groups
                <p className="text-xs text-slate-500 mt-1">Manage pooled assets</p>
              </Link>
              <Link href="/disputes" className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50" onClick={() => setShowMore(false)}>
                Disputes
                <p className="text-xs text-slate-500 mt-1">Review challenges</p>
              </Link>
              <Link href="/dashboard?focus=permissions" className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50" onClick={() => setShowMore(false)}>
                Permissions
                <p className="text-xs text-slate-500 mt-1">Open an asset to manage</p>
              </Link>
              <Link href="/royalties" className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50" onClick={() => setShowMore(false)}>
                Royalties
                <p className="text-xs text-slate-500 mt-1">Track royalty payments</p>
              </Link>
              <Link href="/dashboard/fees" className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-amber-500/50" onClick={() => setShowMore(false)}>
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-amber-400" />
                  Minting Fees
                </div>
                <p className="text-xs text-slate-500 mt-1">Claim derivative fees</p>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
