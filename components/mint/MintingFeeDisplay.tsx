'use client';

import { Coins, Users, TrendingUp, Info, Loader2 } from 'lucide-react';
import type { MintingFeeInfo } from '@/types/api';
import { formatEth, estimateUsd } from '@/hooks/useMintingFee';

interface MintingFeeDisplayProps {
  feeInfo: MintingFeeInfo | null;
  isLoading?: boolean;
  error?: string | null;
  showDetails?: boolean;
}

/**
 * Display component for minting fee information
 * Shows total fee, breakdown by parent, and calculation details
 */
export default function MintingFeeDisplay({
  feeInfo,
  isLoading,
  error,
  showDetails = true,
}: MintingFeeDisplayProps) {
  if (isLoading) {
    return (
      <div className="p-4 bg-slate-800/50 rounded-xl">
        <div className="flex items-center gap-2 text-slate-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Calculating fee...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
        <p className="text-sm text-red-400">{error}</p>
      </div>
    );
  }

  if (!feeInfo) {
    return null;
  }

  // Free derivative
  if (feeInfo.is_free) {
    return (
      <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-green-400" />
          <span className="text-lg font-semibold text-green-400">FREE</span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          The parent creator has allowed free derivatives
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl">
      {/* Total Fee Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-amber-400" />
          <span className="text-sm text-slate-400">Minting Fee</span>
        </div>
        <div className="text-right">
          <p className="text-xl font-bold text-white">
            {formatEth(feeInfo.total_fee)}
          </p>
          <p className="text-xs text-slate-500">
            {estimateUsd(feeInfo.total_fee)} USD
          </p>
        </div>
      </div>

      {/* Fee Breakdown */}
      {showDetails && feeInfo.breakdown.length > 0 && (
        <div className="space-y-2 pt-3 border-t border-slate-700/50">
          <p className="text-xs text-slate-500 uppercase tracking-wider">
            Breakdown
          </p>

          {feeInfo.breakdown.map((parent) => (
            <div
              key={parent.parent_asset_id}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Users className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                <span className="text-slate-300 truncate">
                  {parent.parent_asset_title}
                </span>
                <span className="text-slate-500 flex-shrink-0">
                  ({parent.attribution_percentage}%)
                </span>
              </div>
              <span className="text-amber-400 ml-2 flex-shrink-0">
                {formatEth(parent.fee_share)}
              </span>
            </div>
          ))}

          {/* Platform Fee */}
          <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700/30">
            <span className="text-slate-500">Platform fee (5%)</span>
            <span className="text-slate-400">
              {formatEth(feeInfo.platform_fee)}
            </span>
          </div>
        </div>
      )}

      {/* Formula Details (Collapsible) */}
      {showDetails && (
        <details className="mt-3 pt-3 border-t border-slate-700/50">
          <summary className="text-xs text-slate-500 cursor-pointer flex items-center gap-1 hover:text-slate-400 transition-colors">
            <Info className="w-3 h-3" />
            How is this calculated?
          </summary>
          <div className="mt-2 p-2 bg-slate-900/50 rounded text-xs text-slate-400 space-y-1">
            <p>
              <strong>Formula:</strong> base_fee x popularity_factor x
              attribution%
            </p>
            {feeInfo.breakdown.map((parent) => (
              <div
                key={parent.parent_asset_id}
                className="pl-2 border-l border-slate-700"
              >
                <p className="text-slate-500">{parent.parent_asset_title}:</p>
                <p>Base fee: {formatEth(parent.base_minting_fee)}</p>
                <p>
                  Popularity: {parent.popularity_factor.toFixed(2)}x (
                  {parent.derivative_count} derivatives)
                </p>
                <p>Attribution: {parent.attribution_percentage}%</p>
              </div>
            ))}
            <p className="text-slate-500 mt-2 pt-2 border-t border-slate-700">
              95% goes to creators, 5% platform fee
            </p>
          </div>
        </details>
      )}

      {/* Info Box */}
      <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/20 rounded-lg">
        <p className="text-xs text-blue-300">
          This fee supports the original creators and the creative ecosystem.
        </p>
      </div>
    </div>
  );
}

/**
 * Compact version for inline display
 */
export function MintingFeeCompact({
  feeInfo,
  isLoading,
}: {
  feeInfo: MintingFeeInfo | null;
  isLoading?: boolean;
}) {
  if (isLoading) {
    return (
      <span className="text-slate-400 text-sm flex items-center gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
        Calculating...
      </span>
    );
  }

  if (!feeInfo) return null;

  if (feeInfo.is_free) {
    return (
      <span className="text-green-400 text-sm font-medium flex items-center gap-1">
        <Coins className="w-4 h-4" />
        FREE
      </span>
    );
  }

  return (
    <span className="text-amber-400 text-sm font-medium flex items-center gap-1">
      <Coins className="w-4 h-4" />
      {formatEth(feeInfo.total_fee)}
    </span>
  );
}

/**
 * Fee badge for asset cards
 */
export function MintingFeeBadge({ fee }: { fee: number }) {
  if (fee === 0) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
        <Coins className="w-3 h-3" />
        Free Remixes
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full">
      <Coins className="w-3 h-3" />
      {formatEth(fee)} to remix
    </span>
  );
}
