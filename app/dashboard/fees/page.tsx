'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Coins,
  Loader2,
  ArrowUpDown,
  Search,
  CheckCircle,
  Clock,
  TrendingUp,
  Wallet,
  ExternalLink,
} from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import {
  useFeeStats,
  useFeePayments,
  useClaimMintingFees,
  useClaimAllFees,
  formatEth,
} from '@/hooks/useMintingFee';
import type { MintingFeePayment } from '@/types/api';

export default function FeesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // Fetch fee stats and payments
  const { data: feeStats, isLoading: statsLoading } = useFeeStats();
  const { data: payments, isLoading: paymentsLoading } = useFeePayments({ type: 'all' });

  // Claim hooks
  const claimMutation = useClaimMintingFees();
  const { claimAll, isClaimingAll } = useClaimAllFees();

  // Filter/sort state
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'received' | 'paid'>('all');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Filter and sort payments
  const filtered = useMemo(() => {
    if (!payments) return [];

    let result = [...payments];

    // Filter by type (is_received: true = received fees, false = paid fees)
    if (filterType === 'received') {
      result = result.filter((p) => p.is_received === true);
    } else if (filterType === 'paid') {
      result = result.filter((p) => p.is_received === false);
    }

    // Search
    if (search) {
      const query = search.toLowerCase();
      result = result.filter((p) => {
        const text = `${p.derivative_title} ${p.parent_title} ${p.payer_username} ${p.transaction_hash || ''}`.toLowerCase();
        return text.includes(query);
      });
    }

    // Sort
    result.sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      if (sortBy === 'amount') {
        return dir * (a.fee_amount - b.fee_amount);
      }
      return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    });

    return result;
  }, [payments, search, filterType, sortBy, sortDir]);

  // Handle claim for individual asset
  const handleClaimAsset = async (assetId: string) => {
    await claimMutation.mutateAsync(assetId);
  };

  // Handle claim all
  const handleClaimAll = async () => {
    if (!feeStats?.assets_with_fees) return;
    const assetIds = feeStats.assets_with_fees
      .filter((a) => a.unclaimed_amount > 0)
      .map((a) => a.id);
    await claimAll(assetIds);
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  const isLoading = statsLoading || paymentsLoading;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Minting Fees</h1>
          <p className="text-slate-400 text-sm mt-1">
            Track and claim fees from derivatives of your work
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          {
            label: 'Total Earned',
            value: formatEth(feeStats?.total_earned || 0),
            icon: TrendingUp,
            color: 'text-green-400',
          },
          {
            label: 'Unclaimed',
            value: formatEth(feeStats?.total_unclaimed || 0),
            icon: Clock,
            color: 'text-amber-400',
          },
          {
            label: 'Claimed',
            value: formatEth(feeStats?.total_claimed || 0),
            icon: CheckCircle,
            color: 'text-blue-400',
          },
          {
            label: 'Fees Paid',
            value: formatEth(feeStats?.fees_paid_as_creator || 0),
            icon: Wallet,
            color: 'text-purple-400',
          },
        ].map((item) => (
          <div
            key={item.label}
            className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3"
          >
            <item.icon className={`w-5 h-5 ${item.color} shrink-0`} />
            <div>
              <p className="text-xs text-slate-400">{item.label}</p>
              <p className="text-lg font-semibold text-white">{item.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Claim All Button */}
      {(feeStats?.total_unclaimed || 0) > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold">
              You have {formatEth(feeStats?.total_unclaimed || 0)} in unclaimed fees
            </p>
            <p className="text-slate-400 text-sm">
              From {feeStats?.assets_with_fees?.filter((a) => a.unclaimed_amount > 0).length || 0}{' '}
              assets
            </p>
          </div>
          <Button
            onClick={handleClaimAll}
            disabled={isClaimingAll}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            {isClaimingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Claiming...
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 mr-2" />
                Claim All
              </>
            )}
          </Button>
        </div>
      )}

      {/* Assets with Fees */}
      {feeStats?.assets_with_fees && feeStats.assets_with_fees.length > 0 && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold text-white mb-4">Your Assets</h2>
          <div className="space-y-3">
            {feeStats.assets_with_fees.map((asset) => (
              <div
                key={asset.id}
                className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {asset.thumbnail && (
                    <Image
                      src={asset.thumbnail}
                      alt={asset.title}
                      width={48}
                      height={48}
                      className="w-12 h-12 rounded-lg object-cover"
                    />
                  )}
                  <div>
                    <Link
                      href={`/asset/${asset.id}`}
                      className="text-white font-medium hover:text-amber-400 transition-colors"
                    >
                      {asset.title}
                    </Link>
                    <div className="flex items-center gap-4 text-xs text-slate-400">
                      <span>Fee: {formatEth(asset.minting_fee)}</span>
                      <span>{asset.derivative_count} derivatives</span>
                      <span>Earned: {formatEth(asset.total_earned)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {asset.unclaimed_amount > 0 ? (
                    <>
                      <span className="text-amber-400 font-medium">
                        {formatEth(asset.unclaimed_amount)} unclaimed
                      </span>
                      <Button
                        onClick={() => handleClaimAsset(asset.id)}
                        disabled={claimMutation.isPending}
                        className="text-sm px-3 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30"
                      >
                        Claim
                      </Button>
                    </>
                  ) : (
                    <span className="text-slate-500 text-sm">All claimed</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History Header */}
      <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
        <h2 className="text-lg font-semibold text-white">Payment History</h2>
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-40 px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 text-sm"
            />
          </div>

          {/* Filter Type */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500/50"
          >
            <option value="all">All Payments</option>
            <option value="received">Received</option>
            <option value="paid">Paid</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500/50"
          >
            <option value="date">Sort by date</option>
            <option value="amount">Sort by amount</option>
          </select>

          {/* Sort Direction */}
          <button
            onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
            className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-amber-500/50"
            aria-label="Toggle sort direction"
          >
            <ArrowUpDown className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Payment List */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-slate-400 justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin" /> Loading payments...
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50 text-slate-400 space-y-2 text-center">
          <p className="font-semibold text-slate-200">No fee payments yet.</p>
          <p className="text-sm text-slate-500">
            Payments will appear here when others create derivatives of your work.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((payment) => (
            <PaymentCard key={payment.id} payment={payment} />
          ))}
        </div>
      )}
    </div>
  );
}

function PaymentCard({ payment }: { payment: MintingFeePayment }) {
  const isReceived = payment.is_received === true;

  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                isReceived
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-purple-500/20 text-purple-400'
              }`}
            >
              {isReceived ? 'Received' : 'Paid'}
            </span>
            <span
              className={`px-2 py-0.5 rounded-full text-xs ${
                payment.status === 'claimed'
                  ? 'bg-blue-500/20 text-blue-400'
                  : payment.status === 'paid'
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-slate-500/20 text-slate-400'
              }`}
            >
              {payment.status}
            </span>
          </div>

          <p className="text-white font-medium truncate">
            {isReceived ? (
              <>
                <span className="text-slate-400">From derivative:</span>{' '}
                {payment.derivative_title}
              </>
            ) : (
              <>
                <span className="text-slate-400">For parent:</span>{' '}
                {payment.parent_title}
              </>
            )}
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-400">
            {isReceived ? (
              <span>Paid by: {payment.payer_username}</span>
            ) : (
              <span>To: {payment.parent_creator}</span>
            )}
            <span>Attribution: {payment.attribution_percentage}%</span>
            <span>{new Date(payment.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="text-right">
          <p
            className={`text-lg font-bold ${
              isReceived ? 'text-green-400' : 'text-purple-400'
            }`}
          >
            {isReceived ? '+' : '-'}
            {formatEth(payment.fee_amount)}
          </p>
          {payment.transaction_hash && (
            <a
              href={`https://odyssey.storyscan.xyz/tx/${payment.transaction_hash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-slate-500 hover:text-amber-400 flex items-center gap-1 justify-end"
            >
              View tx <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
