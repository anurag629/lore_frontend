'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface KeyboardShortcutsOptions {
  onSearch?: () => void;
  onNewAsset?: () => void;
  onEscape?: () => void;
  enabled?: boolean;
}

/**
 * Hook for handling global keyboard shortcuts
 * 
 * Shortcuts:
 * - Cmd/Ctrl + K: Focus search (on explore page) or navigate to explore
 * - Cmd/Ctrl + N: Open new asset modal
 * - Escape: Close modals
 */
export function useKeyboardShortcuts({
  onSearch,
  onNewAsset,
  onEscape,
  enabled = true,
}: KeyboardShortcutsOptions = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        
        if (onSearch) {
          onSearch();
        } else {
          // Default behavior: navigate to explore page and focus search
          if (pathname !== '/explore') {
            router.push('/explore');
            // Small delay to ensure page is loaded before focusing
            setTimeout(() => {
              const searchInput = document.querySelector<HTMLInputElement>(
                'input[type="text"][placeholder*="Search"], input[type="search"]'
              );
              if (searchInput) {
                searchInput.focus();
                searchInput.select();
              }
            }, 100);
          } else {
            // Already on explore page, just focus search
            const searchInput = document.querySelector<HTMLInputElement>(
              'input[type="text"][placeholder*="Search"], input[type="search"]'
            );
            if (searchInput) {
              searchInput.focus();
              searchInput.select();
            }
          }
        }
      }

      // Cmd/Ctrl + N: New Asset
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        if (onNewAsset) {
          onNewAsset();
        }
      }

      // Escape: Close modals
      if (e.key === 'Escape') {
        if (onEscape) {
          onEscape();
        } else {
          // Default behavior: close any open modals
          // Check if there's a modal open (common patterns)
          const modals = document.querySelectorAll('[role="dialog"], .modal, [data-modal="true"]');
          if (modals.length > 0) {
            // Find the topmost modal and trigger its close handler
            const topModal = Array.from(modals).pop();
            const closeButton = topModal?.querySelector<HTMLElement>(
              'button[aria-label*="close" i], button[aria-label*="Close" i], button:has(svg[x])'
            );
            if (closeButton) {
              closeButton.click();
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, onSearch, onNewAsset, onEscape, router, pathname]);

  return {
    searchInputRef,
  };
}

