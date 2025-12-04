'use client';

import { motion } from 'framer-motion';
import { User, Settings, Share2, Copy, Wallet, Grid, List, Loader2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';
import { useClipboard } from '@/hooks/useClipboard';
import { ProfileSkeleton } from '@/components/ui/Skeleton';
import OptimizedImage from '@/components/ui/OptimizedImage';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { showToast } = useToast();
  const { copy } = useClipboard();

  // Redirect to dynamic profile page if user is authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated && user) {
      router.push(`/profile/${user.wallet_address}`);
    } else if (!isLoading && !isAuthenticated) {
      router.push('/');
      showToast('Please connect your wallet to view your profile', 'warning');
    }
  }, [isLoading, isAuthenticated, user, router, showToast]);

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
    </div>
  );
}
