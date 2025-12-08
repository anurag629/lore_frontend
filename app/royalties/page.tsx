'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Coins, Loader2, ArrowLeft, ListFilter, ArrowUpDown, Search, BarChart3 } from 'lucide-react';
import { assetsAPI } from '@/lib/api';
import type { RoyaltyPayment } from '@/types/api';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function RoyaltiesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [payments, setPayments] = useState<RoyaltyPayment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'block'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [minAmount, setMinAmount] = useState('');

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await assetsAPI.getRoyaltyPayments();
        const items = Array.isArray(data.results) ? data.results : data;
        setPayments(items || []);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to load royalty payments');
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const total = useMemo(() => {
    return payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  }, [payments]);

  const filtered = useMemo(() => {
    const base = payments.filter((p) => {
      const query = search.toLowerCase();
      if (query) {
        const text = `${p.asset.title} ${p.transaction_hash || ''}`.toLowerCase();
        if (!text.includes(query)) return false;
      }
      if (minAmount) {
        const numeric = Number(minAmount);
        if (!Number.isNaN(numeric) && Number(p.amount || 0) < numeric) return false;
      }
      return true;
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'amount':
          return dir * (Number(a.amount || 0) - Number(b.amount || 0));
        case 'block':
          return dir * ((a.block_number || 0) - (b.block_number || 0));
        case 'date':
        default:
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });
    return sorted;
  }, [payments, search, minAmount, sortBy, sortDir]);

  const latest = useMemo(() => {
    if (payments.length === 0) return null;
    return payments.reduce((prev, curr) =>
      new Date(curr.created_at).getTime() > new Date(prev.created_at).getTime() ? curr : prev
    );
  }, [payments]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    router.push('/');
    return null;
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center gap-3 text-slate-300 hover:text-slate-50 transition-colors cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-2">
          <div className="flex items-center gap-3 text-amber-400">
            <Coins className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">Royalties</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Royalty Payments</h1>
          <p className="text-slate-400 text-sm">Total received: {total.toFixed(4)} (raw units)</p>
        </div>

        {/* Analytics Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Payments', value: payments.length, icon: Coins },
            { label: 'Total Amount', value: total.toFixed(4), icon: BarChart3 },
            {
              label: 'Latest',
              value: latest ? new Date(latest.created_at).toLocaleDateString() : '—',
              icon: ArrowUpDown,
            },
            { label: 'Min Filter', value: minAmount || 'none', icon: ListFilter },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3">
              <item.icon className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-lg font-semibold text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Filters / Sorting */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center gap-2 w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by asset or tx hash"
              className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
          </div>
          <div className="flex items-center gap-2">
            <ListFilter className="w-4 h-4 text-slate-400" />
            <input
              type="number"
              min={0}
              step="0.0001"
              value={minAmount}
              onChange={(e) => setMinAmount(e.target.value)}
              placeholder="Min amount"
              className="w-28 px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
            />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500/50"
            >
              <option value="date">Sort by date</option>
              <option value="amount">Sort by amount</option>
              <option value="block">Sort by block</option>
            </select>
            <button
              onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
              className="px-2 py-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 hover:border-amber-500/50"
              aria-label="Toggle sort direction"
            >
              <ArrowUpDown className="w-4 h-4" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading payments...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50 text-slate-400 space-y-2 text-center">
            <p className="font-semibold text-slate-200">No royalty payments yet.</p>
            <p className="text-sm text-slate-500">New payments will appear here with details and explorer links.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((p) => (
              <div key={p.id} className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start justify-between gap-4">
                <div>
                  <p className="text-white font-semibold">{p.asset.title}</p>
                  <p className="text-slate-400 text-sm">Amount: {p.amount}</p>
                  <p className="text-slate-500 text-xs">Block: {p.block_number}</p>
                  <p className="text-slate-500 text-xs">Date: {new Date(p.created_at).toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/royalties/${p.id}`}
                    className="px-3 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition text-sm"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

