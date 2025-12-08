'use client';

import {
  Users,
  Plus,
  Loader2,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  ListFilter,
  ArrowUpDown,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGroups } from '@/hooks/useGroups';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import CreateGroupModal from '@/components/groups/CreateGroupModal';
import { useToast } from '@/components/ui/Toast';

export default function GroupsPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { groups, loading, error, refetch } = useGroups(
    user?.wallet_address ? { creator: user.wallet_address } : undefined
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | 'registered' | 'pending' | 'failed'>('all');
  const [activeOnly, setActiveOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'created' | 'members' | 'name' | 'status'>('created');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const { showToast } = useToast();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [authLoading, isAuthenticated, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'registered':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-medium">
            <CheckCircle2 className="w-3 h-3" />
            Registered
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-500/20 text-amber-400 rounded text-xs font-medium">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-medium">
            <XCircle className="w-3 h-3" />
            Failed
          </span>
        );
      default:
        return null;
    }
  };

  if (authLoading || (isAuthenticated && !user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const stats = useMemo(() => {
    const totals = groups.reduce(
      (acc, g) => {
        acc.total += 1;
        acc.members += g.member_count || 0;
        acc.status[g.registration_status] = (acc.status[g.registration_status] || 0) + 1;
        if (g.is_active) acc.active += 1;
        return acc;
      },
      { total: 0, active: 0, members: 0, status: {} as Record<string, number> }
    );
    return {
      total: totals.total,
      active: totals.active,
      members: totals.members,
      registered: totals.status['registered'] || 0,
      pending: totals.status['pending'] || 0,
      failed: totals.status['failed'] || 0,
    };
  }, [groups]);

  const filteredGroups = useMemo(() => {
    const filtered = groups.filter((g) => {
      if (activeOnly && g.is_active === false) return false;
      if (statusFilter !== 'all' && g.registration_status !== statusFilter) return false;
      if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      const dir = sortDir === 'asc' ? 1 : -1;
      switch (sortBy) {
        case 'members':
          return dir * ((a.member_count || 0) - (b.member_count || 0));
        case 'name':
          return dir * a.name.localeCompare(b.name);
        case 'status':
          return dir * a.registration_status.localeCompare(b.registration_status);
        case 'created':
        default:
          return dir * (new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      }
    });
    return sorted;
  }, [groups, activeOnly, statusFilter, search, sortBy, sortDir]);

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <Users className="w-8 h-8 sm:w-10 sm:h-10 text-amber-400" />
              Group IP
            </h1>
            <p className="text-slate-400 text-sm sm:text-base">
              Pool multiple IP assets together for collective royalty distribution
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto"
          >
            <Plus className="w-4 h-4" />
            Create Group
          </Button>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-red-300">{error}</p>
          </div>
        )}

        {/* Analytics Snapshot */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Total Groups', value: stats.total, icon: Users },
            { label: 'Registered', value: stats.registered, icon: CheckCircle2 },
            { label: 'Pending', value: stats.pending, icon: Clock },
            { label: 'Members', value: stats.members, icon: BarChart3 },
          ].map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-3 bg-slate-900/60 border border-slate-800 rounded-xl px-4 py-3"
            >
              <item.icon className="w-5 h-5 text-amber-400 shrink-0" />
              <div>
                <p className="text-xs text-slate-400">{item.label}</p>
                <p className="text-lg font-semibold text-white">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
          <div className="flex flex-wrap gap-2">
            {(['all', 'registered', 'pending', 'failed'] as const).map((key) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition ${
                  statusFilter === key
                    ? 'border-amber-500/60 text-amber-200 bg-amber-500/10'
                    : 'border-slate-700 text-slate-300 hover:border-amber-500/40'
                }`}
              >
                {key === 'all' ? 'All Status' : key.charAt(0).toUpperCase() + key.slice(1)}
              </button>
            ))}
            <label className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm border border-slate-700 text-slate-300 cursor-pointer hover:border-amber-500/40">
              <input
                type="checkbox"
                checked={activeOnly}
                onChange={(e) => setActiveOnly(e.target.checked)}
                className="w-4 h-4 text-amber-500 bg-slate-800 border-slate-600 rounded"
              />
              Active only
            </label>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto md:items-center">
            <div className="flex items-center gap-2 w-full sm:w-64">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search groups"
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
                <option value="created">Sort by created</option>
                <option value="members">Sort by members</option>
                <option value="name">Sort by name</option>
                <option value="status">Sort by status</option>
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

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
          </div>
        )}

        {/* Groups List */}
        {!loading && filteredGroups.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Groups Yet</h3>
            <p className="text-slate-500 mb-6">
              Create your first Group IP to pool assets and distribute royalties collectively
            </p>
            <Button variant="primary" onClick={() => setShowCreateModal(true)}>
              <Plus className="w-4 h-4" />
              Create Your First Group
            </Button>
          </div>
        )}

        {/* Groups Grid */}
        {!loading && filteredGroups.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGroups.map((group) => (
              <Link
                key={group.uuid}
                href={`/groups/${group.uuid}`}
                className="group bg-slate-800/50 border border-slate-700 rounded-xl p-6 hover:border-amber-500/50 transition-all hover:shadow-lg hover:shadow-amber-500/10"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">
                      {group.name}
                    </h3>
                    {getStatusBadge(group.registration_status)}
                  </div>
                </div>

                {group.description && (
                  <p className="text-slate-400 text-sm mb-4 line-clamp-2">
                    {group.description}
                  </p>
                )}

                <div className="space-y-2 pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Members</span>
                    <span className="text-white font-medium">{group.member_count}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Total Royalty</span>
                    <span className="text-white font-medium flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {group.total_royalty_percentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Created</span>
                    <span className="text-white font-medium">{formatDate(group.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          refetch();
          showToast('Group created successfully!', 'success');
        }}
      />
    </div>
  );
}

