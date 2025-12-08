'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Users, CheckCircle2, Clock, XCircle, Plus, TrendingUp, BarChart3, ArrowLeft, Trash2, Shield, Link2, AlertTriangle, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useGroup, useGroupStatistics, useGroupDistributions, useAddMember, useRemoveMember, useRegisterGroup } from '@/hooks/useGroups';
import { useToast } from '@/components/ui/Toast';
import Button from '@/components/ui/Button';
import AddMemberModal from '@/components/groups/AddMemberModal';
import type { GroupIPMembership } from '@/types/api';

export default function GroupDetailPage() {
  const params = useParams();
  const router = useRouter();
  const groupId = params?.id ? (params.id as string) : null;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { group, loading: groupLoading, error: groupError, refetch: refetchGroup } = useGroup(groupId);
  const { statistics, loading: statsLoading, refetch: refetchStats } = useGroupStatistics(groupId);
  const { distributions, loading: distLoading, refetch: refetchDists } = useGroupDistributions(groupId);
  const { addMember, loading: addingMember } = useAddMember();
  const { removeMember, loading: removingMember } = useRemoveMember();
  const { registerGroup, loading: registering } = useRegisterGroup();
  const [showAddMember, setShowAddMember] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    refetchGroup();
    refetchStats();
    refetchDists();
  }, [refetchGroup, refetchStats, refetchDists]);

  const isOwner = useMemo(() => {
    if (!group || !user) return false;
    return group.creator.id === user.id;
  }, [group, user]);

  const currentTotalShare = useMemo(() => {
    if (!group?.members) return 0;
    return group.members.reduce((sum, m) => sum + Number(m.revenue_share_percentage || 0), 0);
  }, [group?.members]);

  const existingMembers = useMemo(() => {
    if (!group?.members) return [];
    return group.members.filter(m => m.is_active).map(m => m.asset.id);
  }, [group?.members]);

  const handleRegister = async () => {
    if (!groupId) return;
    const ok = await registerGroup(groupId, user?.wallet_address);
    if (ok) {
      showToast('Group registration submitted', 'success');
      refetchGroup();
    } else {
      showToast('Failed to register group', 'error');
    }
  };

  const handleRemoveMember = async (member: GroupIPMembership) => {
    if (!groupId) return;
    const ok = await removeMember(groupId, member.asset.id);
    if (ok) {
      showToast('Member removed', 'success');
      refetchGroup();
      refetchStats();
    } else {
      showToast('Failed to remove member', 'error');
    }
  };

  if (authLoading || groupLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (groupError || !group) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/60 border border-red-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-3">Group not found</h2>
          <p className="text-slate-300 text-sm mb-4">{groupError || 'Unable to load this group.'}</p>
          <Button variant="outline" onClick={() => router.push('/groups')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Groups
          </Button>
        </div>
      </div>
    );
  }

  const statusBadge = {
    registered: (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-green-500/20 text-green-400 border border-green-500/30">
        <CheckCircle2 className="w-4 h-4" /> Registered
      </span>
    ),
    pending: (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
        <Clock className="w-4 h-4" /> Pending
      </span>
    ),
    failed: (
      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold bg-red-500/20 text-red-300 border border-red-500/30">
        <XCircle className="w-4 h-4" /> Failed
      </span>
    ),
  }[group.registration_status];

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-300 hover:text-slate-50 transition-colors cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </div>
          <div className="flex items-center gap-2">
            {statusBadge}
            {isOwner && group.registration_status !== 'registered' && (
              <Button variant="primary" onClick={handleRegister} disabled={registering}>
                {registering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                Register Group
              </Button>
            )}
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 text-amber-400 mb-2">
                <Users className="w-6 h-6" />
                <span className="text-sm font-semibold uppercase tracking-wide">Group IP</span>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2">{group.name}</h1>
              {group.description && <p className="text-slate-300 max-w-3xl">{group.description}</p>}
              <div className="flex flex-wrap gap-3 text-xs text-slate-400 mt-3">
                <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700">
                  <UserIcon className="w-3.5 h-3.5" /> Creator: {group.creator.display_name || group.creator.wallet_address}
                </span>
                {group.story_group_id && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-slate-800 border border-slate-700">
                    ID: {group.story_group_id}
                  </span>
                )}
              </div>
            </div>
            <div className="text-right">
              <p className="text-slate-400 text-sm">Total Royalty</p>
              <p className="text-2xl font-semibold text-white">{group.total_royalty_percentage}%</p>
              {group.royalty_pool_address && (
                <div className="text-xs text-slate-400 mt-2 break-all">
                  Pool: {group.royalty_pool_address}
                </div>
              )}
              {group.registration_transaction_hash && (
                <div className="text-xs text-slate-400 mt-1 break-all">
                  Tx: {group.registration_transaction_hash}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Members</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" />
                {group.member_count}
              </p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Total Revenue Share</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                {currentTotalShare.toFixed(2)}%
              </p>
              {currentTotalShare > 100.01 && (
                <p className="text-xs text-red-400 mt-1 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Exceeds 100%
                </p>
              )}
              {currentTotalShare < 99.99 && (
                <p className="text-xs text-amber-400 mt-1 inline-flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> Below 100%
                </p>
              )}
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Distributions</p>
              <p className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-blue-400" />
                {statistics?.distributions_count ?? 0}
              </p>
            </div>
          </div>

          {isOwner && (
            <div className="flex flex-wrap gap-3">
              <Button variant="primary" onClick={() => setShowAddMember(true)}>
                <Plus className="w-4 h-4" /> Add Member
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Members */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-white">Members</h2>
                <p className="text-slate-400 text-sm">Assets participating in this group</p>
              </div>
            </div>

            {group.members && group.members.length > 0 ? (
              <div className="space-y-3">
                {group.members.map((member) => (
                  <div key={member.uuid} className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                    <div>
                      <p className="text-white font-semibold">{member.asset.title}</p>
                      <p className="text-slate-400 text-sm">Share: {Number(member.revenue_share_percentage).toFixed(2)}%</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">{member.is_active ? 'Active' : 'Inactive'}</span>
                      {isOwner && (
                        <Button
                          variant="danger"
                          className="px-3 py-2 text-sm"
                          disabled={removingMember}
                          onClick={() => handleRemoveMember(member)}
                        >
                          {removingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-slate-400 text-sm">No members yet.</div>
            )}
          </div>

          {/* Statistics / Distributions */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-white">Statistics</h2>
                <p className="text-slate-400 text-sm">On-chain and revenue metrics</p>
              </div>
              {group.story_group_id && (
                <a
                  href={`https://explorer.story.foundation/group/${group.story_group_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-400 text-xs inline-flex items-center gap-1"
                >
                  <Link2 className="w-3 h-3" /> View on Explorer
                </a>
              )}
            </div>

            {statsLoading ? (
              <div className="flex items-center gap-2 text-slate-400">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading stats...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Total Royalties (ETH)</p>
                  <p className="text-xl font-semibold text-white">
                    {statistics?.total_royalties_received_eth ?? '0'}
                  </p>
                </div>
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                  <p className="text-slate-400 text-sm">Last Distribution</p>
                  <p className="text-xl font-semibold text-white">
                    {statistics?.last_distribution_at ? new Date(statistics.last_distribution_at).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Distributions</h3>
              {distLoading ? (
                <div className="flex items-center gap-2 text-slate-400">
                  <Loader2 className="w-4 h-4 animate-spin" /> Loading distributions...
                </div>
              ) : distributions && distributions.length > 0 ? (
                <div className="space-y-3">
                  {distributions.map((dist) => (
                    <div key={dist.uuid} className="bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                      <p className="text-white font-semibold">{dist.membership.asset.title}</p>
                      <p className="text-slate-400 text-sm">Share: {Number(dist.membership.revenue_share_percentage).toFixed(2)}%</p>
                      <p className="text-slate-400 text-sm">Amount (wei): {dist.amount_wei}</p>
                      <p className="text-slate-500 text-xs">Tx: {dist.tx_hash}</p>
                      <p className="text-slate-500 text-xs">Date: {new Date(dist.distributed_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-slate-400 text-sm">No distributions yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {group && (
        <AddMemberModal
          isOpen={showAddMember}
          onClose={() => setShowAddMember(false)}
          onSuccess={() => {
            refetchGroup();
            refetchStats();
          }}
          groupId={group.id}
          existingMembers={existingMembers}
          currentTotalShare={currentTotalShare}
        />
      )}
    </div>
  );
}

