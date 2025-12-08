'use client';

import { useState } from 'react';
import { Archive, Trash2, Loader2, AlertCircle } from 'lucide-react';
import { useRestoreAsset, usePermanentDeleteAsset } from '@/hooks/useAssets';
import { useToast } from '@/components/ui/Toast';
import type { IPAssetListItem } from '@/types/api';

interface ArchiveActionsProps {
  asset: IPAssetListItem;
  onSuccess?: () => void;
}

export default function ArchiveActions({ asset, onSuccess }: ArchiveActionsProps) {
  const [showPermanentDeleteConfirm, setShowPermanentDeleteConfirm] = useState(false);
  const { restoreAsset, loading: restoring, error: restoreError } = useRestoreAsset();
  const { permanentDeleteAsset, loading: deleting, error: deleteError } = usePermanentDeleteAsset();
  const { showToast } = useToast();

  const handleRestore = async () => {
    const result = await restoreAsset(asset.id);
    if (result) {
      showToast('Asset restored successfully', 'success');
      onSuccess?.();
    } else {
      showToast(restoreError || 'Failed to restore asset', 'error');
    }
  };

  const handlePermanentDelete = async () => {
    const result = await permanentDeleteAsset(asset.id);
    if (result) {
      showToast('Asset permanently deleted', 'success');
      setShowPermanentDeleteConfirm(false);
      onSuccess?.();
    } else {
      showToast(deleteError || 'Failed to permanently delete asset', 'error');
    }
  };

  if (!asset.is_deleted) {
    return null; // Don't show archive actions for non-archived assets
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Error Messages */}
      {restoreError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{restoreError}</p>
        </div>
      )}
      {deleteError && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-red-300 text-sm">{deleteError}</p>
        </div>
      )}

      {!showPermanentDeleteConfirm ? (
        <div className="flex gap-2">
          <button
            onClick={handleRestore}
            disabled={restoring || deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600/10 hover:bg-green-600/20 border border-green-500/30 hover:border-green-500/50 text-green-400 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {restoring ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <Archive className="w-4 h-4" />
                Restore
              </>
            )}
          </button>
          <button
            onClick={() => setShowPermanentDeleteConfirm(true)}
            disabled={restoring || deleting}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 hover:border-red-500/50 text-red-400 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="w-4 h-4" />
            Delete Forever
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-sm text-red-300 font-medium mb-2">
              Permanently delete this asset?
            </p>
            <p className="text-xs text-red-400">
              This action cannot be undone. The asset will be permanently removed from the database.
              Note: The blockchain registration cannot be removed (blockchain is immutable).
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPermanentDeleteConfirm(false)}
              disabled={deleting}
              className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg font-medium transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handlePermanentDelete}
              disabled={deleting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Confirm Delete
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

