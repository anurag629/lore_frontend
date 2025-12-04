'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import MintModal from '@/components/mint/MintModal';

interface KeyboardShortcutsContextType {
  openMintModal: () => void;
  closeMintModal: () => void;
  isMintModalOpen: boolean;
  focusSearch: () => void;
}

const KeyboardShortcutsContext = createContext<KeyboardShortcutsContextType | undefined>(undefined);

export function useKeyboardShortcutsContext() {
  const context = useContext(KeyboardShortcutsContext);
  if (!context) {
    throw new Error('useKeyboardShortcutsContext must be used within KeyboardShortcutsProvider');
  }
  return context;
}

export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isMintModalOpen, setIsMintModalOpen] = useState(false);

  const openMintModal = useCallback(() => {
    setIsMintModalOpen(true);
  }, []);

  const closeMintModal = useCallback(() => {
    setIsMintModalOpen(false);
  }, []);

  const focusSearch = useCallback(() => {
    if (pathname !== '/explore') {
      router.push('/explore');
      // Small delay to ensure page is loaded before focusing
      setTimeout(() => {
        const searchInput = document.getElementById('search-input') as HTMLInputElement | null || 
          document.querySelector<HTMLInputElement>(
            'input[type="text"][placeholder*="Search" i], input[type="search"]'
          );
        if (searchInput && searchInput instanceof HTMLInputElement) {
          searchInput.focus();
          searchInput.select();
        }
      }, 200);
    } else {
      // Already on explore page, just focus search
      const searchInput = document.getElementById('search-input') as HTMLInputElement | null || 
        document.querySelector<HTMLInputElement>(
          'input[type="text"][placeholder*="Search" i], input[type="search"]'
        );
      if (searchInput && searchInput instanceof HTMLInputElement) {
        searchInput.focus();
        searchInput.select();
      }
    }
  }, [pathname, router]);

  // Set up global keyboard shortcuts
  useKeyboardShortcuts({
    onSearch: focusSearch,
    onNewAsset: openMintModal,
    onEscape: () => {
      // Close any open modals
      if (isMintModalOpen) {
        closeMintModal();
      }
    },
    enabled: true,
  });

  return (
    <KeyboardShortcutsContext.Provider
      value={{
        openMintModal,
        closeMintModal,
        isMintModalOpen,
        focusSearch,
      }}
    >
      {children}
      {/* Render MintModal here so it can be controlled by keyboard shortcuts */}
      <MintModal isOpen={isMintModalOpen} onClose={closeMintModal} />
    </KeyboardShortcutsContext.Provider>
  );
}

