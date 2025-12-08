'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, AlertTriangle, CheckCircle2, XCircle, Clock, FileText, Shield, ArrowLeft } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useAuth } from '@/hooks/useAuth';
import { useDispute, useDisputeEvidence, useSubmitEvidence, useResolveDispute, useCancelDispute } from '@/hooks/useDisputes';
import { useToast } from '@/components/ui/Toast';

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

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const disputeId = params?.id ? (params.id as string) : null;
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { dispute, loading, error, refetch } = useDispute(disputeId);
  const { evidence, loading: evidenceLoading, refetch: refetchEvidence } = useDisputeEvidence(disputeId);
  const { submitEvidence, loading: submitting, error: submitError, clearError: clearSubmitError } = useSubmitEvidence();
  const { resolveDispute, loading: resolving, error: resolveError, clearError: clearResolveError } = useResolveDispute();
  const { cancelDispute, loading: canceling, error: cancelError, clearError: clearCancelError } = useCancelDispute();
  const { showToast } = useToast();

  const [evidenceText, setEvidenceText] = useState('');
  const [evidenceUrl, setEvidenceUrl] = useState('');
  const [resolution, setResolution] = useState<'upheld' | 'rejected' | 'settled'>('upheld');
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    refetch();
    refetchEvidence();
  }, [refetch, refetchEvidence]);

  const isAdmin = useMemo(() => user?.is_staff === true, [user]);
  const isDisputer = useMemo(() => dispute && user && dispute.disputer.id === user.id, [dispute, user]);

  if (authLoading || loading) {
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

  if (error || !dispute) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/60 border border-red-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-3">Dispute not found</h2>
          <p className="text-slate-300 text-sm mb-4">{error || 'Unable to load this dispute.'}</p>
          <Button variant="outline" onClick={() => router.push('/disputes')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Disputes
          </Button>
        </div>
      </div>
    );
  }

  const handleSubmitEvidence = async () => {
    if (!disputeId) return;
    if (!evidenceText.trim()) {
      showToast('Please add evidence description', 'warning');
      return;
    }
    const res = await submitEvidence(disputeId, { description: evidenceText, evidence_url: evidenceUrl || undefined });
    if (res) {
      showToast('Evidence submitted', 'success');
      setEvidenceText('');
      setEvidenceUrl('');
      refetchEvidence();
    } else {
      showToast(submitError || 'Failed to submit evidence', 'error');
    }
  };

  const handleResolve = async () => {
    if (!disputeId) return;
    const ok = await resolveDispute(disputeId, { result: resolution, resolution_notes: resolutionNotes });
    if (ok) {
      showToast('Dispute resolved', 'success');
      refetch();
      refetchEvidence();
    } else {
      showToast(resolveError || 'Failed to resolve dispute', 'error');
    }
  };

  const handleCancel = async () => {
    if (!disputeId) return;
    const ok = await cancelDispute(disputeId);
    if (ok) {
      showToast('Dispute cancelled', 'success');
      refetch();
      refetchEvidence();
    } else {
      showToast(cancelError || 'Failed to cancel dispute', 'error');
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-slate-300 hover:text-slate-50 transition-colors cursor-pointer" onClick={() => router.back()}>
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </div>
          {statusBadge(dispute.status)}
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-3 shadow-2xl">
          <div className="flex items-center gap-3 text-amber-400">
            <AlertTriangle className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">Dispute</span>
          </div>
          <h1 className="text-3xl font-bold text-white">{dispute.target_asset.title}</h1>
          <p className="text-slate-300">{dispute.reason}</p>
          <p className="text-slate-400 text-sm">Raised by {dispute.disputer.display_name || dispute.disputer.wallet_address}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Status</p>
            {statusBadge(dispute.status)}
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Evidence Count</p>
            <p className="text-2xl font-semibold text-white">{dispute.evidence_count}</p>
          </div>
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <p className="text-slate-400 text-sm mb-1">Result</p>
            <p className="text-white font-semibold">{dispute.result || 'Pending'}</p>
          </div>
        </div>

        {/* Evidence List */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-white">Evidence</h2>
              <p className="text-slate-400 text-sm">Submitted evidence for this dispute</p>
            </div>
          </div>

          {evidenceLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin" /> Loading evidence...
            </div>
          ) : evidence && evidence.length > 0 ? (
            <div className="space-y-3">
              {evidence.map((ev) => (
                <div key={ev.uuid} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                  <p className="text-white font-semibold">{ev.description}</p>
                  {ev.evidence_url && (
                    <a href={ev.evidence_url} target="_blank" rel="noopener noreferrer" className="text-amber-400 text-sm underline">
                      Evidence link
                    </a>
                  )}
                  <p className="text-slate-500 text-xs mt-1">By {ev.submitted_by.display_name || ev.submitted_by.wallet_address}</p>
                  <p className="text-slate-500 text-xs">At {new Date(ev.submitted_at).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-slate-400 text-sm">No evidence yet.</div>
          )}
        </div>

        {/* Submit Evidence */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-amber-400" /> Submit Evidence
          </h2>
          {submitError && <p className="text-red-400 text-sm">{submitError}</p>}
          <div className="space-y-3">
            <textarea
              value={evidenceText}
              onChange={(e) => {
                clearSubmitError();
                setEvidenceText(e.target.value);
              }}
              placeholder="Describe your evidence"
              rows={4}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <input
              type="url"
              value={evidenceUrl}
              onChange={(e) => {
                clearSubmitError();
                setEvidenceUrl(e.target.value);
              }}
              placeholder="Evidence URL (optional)"
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <Button variant="primary" onClick={handleSubmitEvidence} disabled={submitting}>
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              Submit Evidence
            </Button>
          </div>
        </div>

        {/* Admin Resolution / Cancel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-400" /> Actions
            </h2>
            {cancelError && <p className="text-red-400 text-sm">{cancelError}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            {isDisputer && dispute.status !== 'resolved' && dispute.status !== 'cancelled' && (
              <Button variant="danger" onClick={handleCancel} disabled={canceling}>
                {canceling ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                Cancel Dispute
              </Button>
            )}

            {isAdmin && dispute.status !== 'resolved' && (
              <div className="w-full bg-slate-800/60 border border-slate-700 rounded-xl p-4 space-y-3">
                {resolveError && <p className="text-red-400 text-sm">{resolveError}</p>}
                <div className="flex flex-wrap gap-3 items-center">
                  <label className="text-slate-300 text-sm">Result:</label>
                  <select
                    value={resolution}
                    onChange={(e) => {
                      clearResolveError();
                      setResolution(e.target.value as any);
                    }}
                    className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  >
                    <option value="upheld">Upheld</option>
                    <option value="rejected">Rejected</option>
                    <option value="settled">Settled</option>
                  </select>
                </div>
                <textarea
                  value={resolutionNotes}
                  onChange={(e) => {
                    clearResolveError();
                    setResolutionNotes(e.target.value);
                  }}
                  placeholder="Resolution notes (optional)"
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button variant="primary" onClick={handleResolve} disabled={resolving}>
                  {resolving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  Resolve Dispute
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

