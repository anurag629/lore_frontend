'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, BarChart3, User, Sparkles, Settings, Plus, FolderOpen } from 'lucide-react';
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
              const isActive = pathname === item.href;

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
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 p-4">
        <div className="glass rounded-2xl p-2 flex items-center justify-around shadow-2xl shadow-black/50 border border-white/10 bg-slate-950/90 backdrop-blur-xl">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-300 relative group",
                  isActive 
                    ? "text-amber-400" 
                    : "text-slate-400 hover:text-white"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-600/20 border border-amber-500/20 rounded-xl"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <Icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-amber-400" : "group-hover:text-amber-400")} />
                <span className="font-medium relative z-10">{item.name}</span>
              </Link>
            );
          })}
          
          <button
            onClick={handleOpenMintModal}
            className="flex flex-col items-center gap-1 p-2 text-slate-400 hover:text-white"
          >
            <div className="p-2 rounded-xl bg-gradient-to-br from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/20">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-medium">Mint</span>
          </button>
        </div>
      </div>
    </>
  );
}
