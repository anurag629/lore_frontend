'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useValidateAsset } from '@/hooks/useAI';
import { ValidationResult } from './ValidationResult';
import { Shield, Loader2 } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface ValidationButtonProps {
  assetUuid: string;
  onValidationComplete?: (result: any) => void;
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

export function ValidationButton({
  assetUuid,
  onValidationComplete,
  variant = 'default',
  size = 'default'
}: ValidationButtonProps) {
  const [open, setOpen] = useState(false);
  const { mutate: validate, data, isPending, isError, error } = useValidateAsset();

  const handleValidate = () => {
    validate(assetUuid, {
      onSuccess: (result) => {
        toast({
          title: 'Validation Complete',
          description: `Asset validated with verdict: ${result.overall_verdict}`,
        });
        if (onValidationComplete) {
          onValidationComplete(result);
        }
      },
      onError: (err: any) => {
        toast({
          title: 'Validation Failed',
          description: err.response?.data?.detail || err.message,
          variant: 'destructive',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} onClick={() => setOpen(true)}>
          <Shield className="h-4 w-4 mr-2" />
          Validate Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>AI Asset Validation</DialogTitle>
          <DialogDescription>
            Comprehensive pre-mint validation including copyright detection, quality analysis, and pricing recommendations.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {!data && !isPending && (
            <div className="text-center py-8">
              <Shield className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">Ready to Validate</h3>
              <p className="text-sm text-gray-600 mb-4">
                This will analyze your asset for copyright issues, quality metrics, and suggest optimal pricing.
              </p>
              <Button onClick={handleValidate} size="lg">
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
      </DialogContent>
    </Dialog>
  );
}
