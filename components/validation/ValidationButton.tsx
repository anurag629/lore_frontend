'use client';

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { useValidateAsset } from '@/hooks/useAI';
import { ValidationResult } from './ValidationResult';
import { Shield, Loader2, X } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

interface ValidationButtonProps {
  assetUuid: string;
  onValidationComplete?: (result: any) => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
}

export function ValidationButton({
  assetUuid,
  onValidationComplete,
  variant = 'primary',
}: ValidationButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate: validate, data, isPending, isError, error } = useValidateAsset();
  const { showToast } = useToast();

  const handleValidate = () => {
    validate(assetUuid, {
      onSuccess: (result) => {
        showToast(`Asset validated with verdict: ${result.overall_verdict}`, 'success');
        if (onValidationComplete) {
          onValidationComplete(result);
        }
      },
      onError: (err: any) => {
        showToast(err.response?.data?.detail || err.message || 'Validation failed', 'error');
      },
    });
  };

  return (
    <>
      <Button variant={variant} onClick={() => setOpen(true)}>
        <Shield className="h-4 w-4 mr-2" />
        Validate Asset
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative z-50 w-full max-w-4xl max-h-[80vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold text-white">AI Asset Validation</h2>
                <p className="text-sm text-slate-400">
                  Comprehensive pre-mint validation including copyright detection, quality analysis, and pricing recommendations.
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {!data && !isPending && !isError && (
                <div className="text-center py-8">
                  <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Ready to Validate</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This will analyze your asset for copyright issues, quality metrics, and suggest optimal pricing.
                  </p>
                  <Button onClick={handleValidate}>
                    Start Validation
                  </Button>
                </div>
              )}

              {isPending && (
                <div className="text-center py-12">
                  <Loader2 className="h-12 w-12 mx-auto animate-spin text-blue-500 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Analyzing Your Asset</h3>
                  <p className="text-sm text-gray-600">
                    Running copyright detection, quality analysis, and pricing recommendations...
                  </p>
                </div>
              )}

              {isError && (
                <div className="text-center py-8">
                  <p className="text-red-600 mb-4">{error?.message || 'Validation failed'}</p>
                  <Button onClick={handleValidate} variant="outline">
                    Try Again
                  </Button>
                </div>
              )}

              {data && <ValidationResult result={data} />}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
