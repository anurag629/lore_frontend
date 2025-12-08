/**
 * React hooks for Dispute API
 */
import { useState, useCallback } from 'react';
import { disputesAPI } from '@/lib/api';
import type {
  Dispute,
  DisputeEvidence,
  DisputeStatistics,
  PaginatedResponse,
} from '@/types/api';

// Hook to fetch list of disputes
export function useDisputes(params?: {
  target_asset?: string;
  disputer?: string;
  status?: 'pending' | 'under_review' | 'resolved' | 'cancelled';
  result?: 'upheld' | 'rejected' | 'settled';
}) {
  const [disputes, setDisputes] = useState<Dispute[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDisputes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<Dispute> = await disputesAPI.getDisputes(params);
      setDisputes(response.results || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch disputes';
      setError(errorMessage);
      console.error('Error fetching disputes:', err);
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(params)]);

  return {
    disputes,
    loading,
    error,
    refetch: fetchDisputes,
  };
}

// Hook to fetch single dispute
export function useDispute(id: string | null) {
  const [dispute, setDispute] = useState<Dispute | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDispute = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const data: Dispute = await disputesAPI.getDispute(id);
      setDispute(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch dispute';
      setError(errorMessage);
      console.error('Error fetching dispute:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    dispute,
    loading,
    error,
    refetch: fetchDispute,
  };
}

// Hook to raise dispute
export function useRaiseDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const raiseDispute = useCallback(async (data: {
    target_asset_uuid: string;
    reason: string;
    evidence_description?: string;
    evidence_url?: string;
  }): Promise<Dispute | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: Dispute = await disputesAPI.raiseDispute(data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to raise dispute';
      setError(errorMessage);
      console.error('Error raising dispute:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    raiseDispute,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to submit evidence
export function useSubmitEvidence() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEvidence = useCallback(async (disputeId: string, data: {
    description: string;
    evidence_url?: string;
  }): Promise<DisputeEvidence | null> => {
    try {
      setLoading(true);
      setError(null);
      const result: DisputeEvidence = await disputesAPI.submitEvidence(disputeId, data);
      return result;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to submit evidence';
      setError(errorMessage);
      console.error('Error submitting evidence:', err);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    submitEvidence,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to resolve dispute (admin)
export function useResolveDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resolveDispute = useCallback(async (disputeId: string, data: {
    result: 'upheld' | 'rejected' | 'settled';
    resolution_notes: string;
  }): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await disputesAPI.resolveDispute(disputeId, data);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to resolve dispute';
      setError(errorMessage);
      console.error('Error resolving dispute:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    resolveDispute,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to cancel dispute
export function useCancelDispute() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const cancelDispute = useCallback(async (disputeId: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await disputesAPI.cancelDispute(disputeId);
      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to cancel dispute';
      setError(errorMessage);
      console.error('Error cancelling dispute:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    cancelDispute,
    loading,
    error,
    clearError: () => setError(null),
  };
}

// Hook to get dispute evidence
export function useDisputeEvidence(id: string | null) {
  const [evidence, setEvidence] = useState<DisputeEvidence[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchEvidence = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response: PaginatedResponse<DisputeEvidence> = await disputesAPI.getEvidence(id);
      setEvidence(response.results || []);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch evidence';
      setError(errorMessage);
      console.error('Error fetching evidence:', err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  return {
    evidence,
    loading,
    error,
    refetch: fetchEvidence,
  };
}

// Hook to get dispute statistics
export function useDisputeStatistics() {
  const [statistics, setStatistics] = useState<DisputeStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStatistics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data: DisputeStatistics = await disputesAPI.getStatistics();
      setStatistics(data);
    } catch (err: any) {
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || 'Failed to fetch statistics';
      setError(errorMessage);
      console.error('Error fetching statistics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    statistics,
    loading,
    error,
    refetch: fetchStatistics,
  };
}

