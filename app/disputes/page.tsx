'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useDisputes } from '@/hooks/useDisputes';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, CheckCircle2, Clock, XCircle, Gavel, BarChart3, ArrowUpDown, ListFilter } from 'lucide-react';
import Button from '@/components/ui/Button';

const statusBadge = (status: string) => {
  switch (status) {
    case 'resolved':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
          <CheckCircle2 className="w-3 h-3" /> Resolved
        </span>
      );
    case 'under_review':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          <Clock className="w-3 h-3" /> Under Review
        </span>
      );
    case 'cancelled':
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-slate-500/20 text-slate-300 border border-slate-500/30">
          <XCircle className="w-3 h-3" /> Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
          <AlertTriangle className="w-3 h-3" /> Pending
        </span>
      );
  }
};

export default function DisputesPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'resolved' | 'cancelled'>('all');
  const [resultFilter, setResultFilter] = useState<'all' | 'upheld' | 'rejected' | 'settled'>('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'updated' | 'evidence' | 'title'>('updated');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { disputes, loading, error, refetch } = useDisputes({
    status: statusFilter === 'all' ? undefined : statusFilter,
    result: resultFilter === 'all' ? undefined : resultFilter,
  });

  useEffect(() => {
    refetch();
  }, [refetch]);

  const stats = useMemo(() => {
    const totals = disputes.reduce(
      (acc, d) => {
        acc.total += 1;
        acc.evidence += d.evidence_count || 0;
        acc.status[d.status] = (acc.status[d.status] || 0) + 1;
        if (d.result) acc.result[d.result] = (acc.result[d.result] || 0) + 1;
        return acc;
      },
      { total: 0, evidence: 0, status: {} as Record<string, number>, result: {} as Record<string, number> }
    );
    return {
      total: totals.total,
      evidence: totals.evidence,
      resolved: totals.status['resolved'] || 0,
      pending: totals.status['pending'] || 0,
      underReview: totals.status['under_review'] || 0,
      cancelled: totals.status['cancelled'] || 0,
      upheld: totals.result['upheld'] || 0,
      rejected: totals.result['rejected'] || 0,
      settled: totals.result['settled'] || 0,
    };
  }, [disputes]);

  const filtered = useMemo(() => {
    const base = disputes.filter((d) => {
      if (search) {
        const text = `${d.target_asset.title} ${d.reason} ${d.disputer.display_name || ''} ${d.disputer.wallet_address || ''}`.toLowerCase();
        if (!text.includes(search.toLowerCase())) return false;
      }
      return true;
    });

    const sorted = [...base].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'evidence':
          return dir * ((a.evidence_count || 0) - (b.evidence_count || 0));
        case 'title':
          return dir * a.target_asset.title.localeCompare(b.target_asset.title);
        case 'updated':
        default:
          return dir * (new Date(a.updated_at || a.raised_at).getTime() - new Date(b.updated_at || b.raised_at).getTime());
      }
    });
    return sorted;
  }, [disputes, search, sortBy, sortDir]);

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
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Gavel className="w-7 h-7 text-amber-400" />
              Disputes
            </h1>
            <p className="text-slate-400">Track and manage disputes across assets</p>
          </div>
          <Link
            href="/explore"
            className="px-4 py-2 rounded-lg border border-slate-700 text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition"
          >
            Open an asset to raise a dispute
          </Link>
        </div>

        {/* Analytics Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats.total, icon: Gavel },
            { label: 'Pending/Review', value: stats.pending + stats.underReview, icon: Clock },
            { label: 'Resolved', value: stats.resolved, icon: CheckCircle2 },
            { label: 'Evidence Items', value: stats.evidence, icon: BarChart3 },
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

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'under_review', 'resolved', 'cancelled'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  statusFilter === key
                    ? 'border-amber-500/60 text-amber-200 bg-amber-500/10'
                    : 'border-slate-700 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                {key === 'all' ? 'All Status' : key.replace('_', ' ')}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'upheld', 'rejected', 'settled'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setResultFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  resultFilter === key
                    ? 'border-amber-500/60 text-amber-200 bg-amber-500/10'
                    : 'border-slate-700 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                {key === 'all' ? 'All Results' : key}
              </button>
            ))}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:items-center">
            <div className="flex items-center gap-2 w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search asset/disputer/reason"
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>
            <div className="flex items-center gap-2">
              <ListFilter className="w-4 h-4 text-slate-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 rounded-lg bg-slate-900 border border-slate-800 text-white text-sm focus:outline-none focus:border-amber-500/50"
              >
                <option value="updated">Sort by updated</option>
                <option value="evidence">Sort by evidence</option>
                <option value="title">Sort by title</option>
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
        </div>

        {error && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin" /> Loading disputes...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-6 border border-slate-800 rounded-xl bg-slate-900/50 text-slate-400">
            No disputes found.
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((d) => (
              <Link
                key={d.uuid}
                href={`/disputes/${d.uuid}`}
                className="block bg-slate-900/60 border border-slate-800 rounded-xl p-4 hover:border-amber-500/50 transition"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-white font-semibold">{d.target_asset.title}</p>
                    <p className="text-slate-400 text-sm line-clamp-2">{d.reason}</p>
                    <p className="text-slate-500 text-xs mt-2">
                      Raised by {d.disputer.display_name || d.disputer.wallet_address}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {statusBadge(d.status)}
                    <span className="text-xs text-slate-400">Evidence: {d.evidence_count}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

