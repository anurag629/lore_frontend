'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Components
import {
  DashboardHero,
  DashboardSkeleton,
  PortfolioChart,
  AssetStatusPie,
  DerivativesTrend,
  ActivityStream,
  QuickActions,
  IPHealthCards,
  EnhancedAssetTable,
  GenealogyGraph,
} from '@/components/dashboard';
import MintModal from '@/components/mint/MintModal';

// Hooks
import { useDashboardStats } from '@/hooks/useDashboardStats';

export default function Dashboard() {
  const router = useRouter();
  const {
    stats,
    user,
    isAuthenticated,
    loading,
    activeAssets,
    archivedAssets,
    genealogyAssets,
    refetch
  } = useDashboardStats();
  const [showMintModal, setShowMintModal] = useState(false);

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/');
    }
  }, [loading, isAuthenticated, router]);

  // Loading state
  if (loading || (isAuthenticated && !user)) {
    return <DashboardSkeleton />;
  }

  // Not authenticated - will redirect
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ==================== HERO ZONE ==================== */}
        <DashboardHero user={user} stats={stats} />

        {/* ==================== INSIGHT ZONE ==================== */}

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Earnings Chart */}
          <div className="md:col-span-2 lg:col-span-1">
            <PortfolioChart totalEarnings={stats.totalEarnings} />
          </div>

          {/* Asset Status Pie */}
          <AssetStatusPie
            data={stats.assetStatusData}
            totalAssets={stats.totalAssets}
          />

          {/* Derivatives Trend */}
          <DerivativesTrend
            data={stats.derivativeGrowthData}
            totalDerivatives={stats.totalDerivatives}
          />
        </div>

        {/* Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Activity Stream */}
          <ActivityStream />

          {/* Quick Actions */}
          <QuickActions onMintClick={() => setShowMintModal(true)} />
        </div>

        {/* ==================== MANAGEMENT ZONE ==================== */}

        {/* IP Health Cards */}
        <IPHealthCards />

        {/* Enhanced Asset Table */}
        <EnhancedAssetTable
          activeAssets={activeAssets}
          archivedAssets={archivedAssets}
          onRefetch={refetch}
        />

        {/* Genealogy Graph */}
        <GenealogyGraph assets={genealogyAssets} />
      </div>

      {/* Mint Modal */}
      <MintModal
        isOpen={showMintModal}
        onClose={() => setShowMintModal(false)}
        onSuccess={() => {
          setShowMintModal(false);
          refetch();
        }}
      />
    </div>
  );
}
