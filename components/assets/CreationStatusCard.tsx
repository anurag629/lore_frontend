'use client';

import { CheckCircle2, XCircle, Loader2, AlertCircle, RefreshCw, Upload, Database, FileText, Shield, FileCheck, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import type { IPAsset, CreationStep } from '@/types/api';

interface CreationStatusCardProps {
  asset: IPAsset;
  onRetry?: () => void;
  isRetrying?: boolean;
}

const STEP_INFO: Record<CreationStep, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  media_upload: { label: 'Media Upload to IPFS', icon: Upload },
  db_save: { label: 'Database Save', icon: Database },
  metadata_upload: { label: 'Metadata Upload to IPFS', icon: FileText },
  story_registration: { label: 'Story Protocol Registration', icon: Shield },
  license_attachment: { label: 'License Terms Attachment', icon: FileCheck },
  completed: { label: 'Completed', icon: CheckCircle2 },
};

const STEP_ORDER: CreationStep[] = [
  'media_upload',
  'db_save',
  'metadata_upload',
  'story_registration',
  'license_attachment',
  'completed',
];

export default function CreationStatusCard({ asset, onRetry, isRetrying = false }: CreationStatusCardProps) {
  const { showToast } = useToast();

  // Check if asset can be retried
  const canRetry = 
    asset.registration_status === 'failed' || 
    (asset.registration_status === 'pending' && asset.creation_step !== 'completed');

  // Get current step index
  const currentStep = asset.creation_step || 'media_upload';
  const failedStep = asset.failed_at_step;
  const currentStepIndex = STEP_ORDER.indexOf(currentStep);
  const failedStepIndex = failedStep ? STEP_ORDER.indexOf(failedStep) : -1;

  // Determine if we should show this card
  if (asset.registration_status === 'registered' && asset.creation_step === 'completed') {
    return null; // Don't show if completed
  }

  const getStepStatus = (step: CreationStep, index: number) => {
    // If there's a failed step, mark it as failed
    if (failedStep && index === failedStepIndex) {
      return 'failed';
    }
    
    // If there's a failed step, all steps before it are completed
    if (failedStep && index < failedStepIndex) {
      return 'completed';
    }
    
    // If no failure, check against current step
    if (!failedStep) {
      if (index < currentStepIndex) {
        return 'completed';
      }
      if (index === currentStepIndex && asset.registration_status === 'retrying') {
        return 'in_progress';
      }
      if (index === currentStepIndex) {
        return 'pending';
      }
    }
    
    // Steps after failed step or future steps are pending
    return 'pending';
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'in_progress':
        return <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />;
      default:
        return <AlertCircle className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 border-green-500/20 bg-green-500/10';
      case 'failed':
        return 'text-red-400 border-red-500/20 bg-red-500/10';
      case 'in_progress':
        return 'text-amber-400 border-amber-500/20 bg-amber-500/10';
      default:
        return 'text-slate-400 border-slate-500/20 bg-slate-500/10';
    }
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-amber-500/20 rounded-xl p-6 space-y-5 shadow-xl shadow-amber-900/10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-lg font-semibold text-white">Asset Creation Status</h3>
          </div>
          <p className="text-sm text-slate-400 ml-13">
            {asset.registration_status === 'failed' 
              ? 'Creation failed. You can retry from the failed step.'
              : asset.registration_status === 'retrying'
              ? 'Retrying creation...'
              : 'Creation in progress...'}
          </p>
        </div>
        {canRetry && onRetry && (
          <Button
            variant="primary"
            onClick={onRetry}
            disabled={isRetrying}
            className="flex items-center gap-2 shrink-0 shadow-lg shadow-amber-600/20"
          >
            {isRetrying ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Retrying...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Retry
              </>
            )}
          </Button>
        )}
      </div>

      {/* Error Message */}
      {asset.registration_error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl backdrop-blur-sm"
        >
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-red-400 font-semibold mb-1">Error Details</p>
              <p className="text-sm text-red-300 leading-relaxed">{asset.registration_error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Steps List */}
      <div className="space-y-2.5">
        {STEP_ORDER.map((step, index) => {
          const status = getStepStatus(step, index);
          const StepIcon = STEP_INFO[step].icon;
          const isCurrentStep = index === currentStepIndex;
          const isFailedStep = index === failedStepIndex;

          return (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
                isCurrentStep || isFailedStep
                  ? getStepColor(status)
                  : status === 'completed'
                  ? 'border-green-500/20 bg-green-500/5 hover:bg-green-500/10'
                  : 'border-slate-700/50 bg-slate-800/30 hover:bg-slate-800/50'
              }`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                status === 'completed' 
                  ? 'bg-green-500/20' 
                  : status === 'failed'
                  ? 'bg-red-500/20'
                  : status === 'in_progress'
                  ? 'bg-amber-500/20'
                  : 'bg-slate-800/50'
              }`}>
                {getStepIcon(status)}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${
                  isCurrentStep || isFailedStep
                    ? status === 'failed' ? 'text-red-400' : status === 'in_progress' ? 'text-amber-400' : 'text-white'
                    : status === 'completed' ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {STEP_INFO[step].label}
                </p>
                {isFailedStep && (
                  <p className="text-xs text-red-400 mt-1 font-medium">Failed at this step</p>
                )}
                {isCurrentStep && status === 'in_progress' && (
                  <p className="text-xs text-amber-400 mt-1 font-medium">In progress...</p>
                )}
              </div>
              {status === 'completed' && (
                <span className="text-xs text-green-400 font-semibold px-2 py-1 bg-green-500/10 rounded-lg">Done</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Additional Info */}
      {asset.registration_attempts && asset.registration_attempts > 0 && (
        <div className="pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5" />
            <span>Registration attempts: <span className="text-slate-400 font-semibold">{asset.registration_attempts}</span></span>
            {asset.last_registration_attempt && (
              <span className="text-slate-600">•</span>
            )}
            {asset.last_registration_attempt && (
              <span>Last attempt: <span className="text-slate-400">{new Date(asset.last_registration_attempt).toLocaleString()}</span></span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

