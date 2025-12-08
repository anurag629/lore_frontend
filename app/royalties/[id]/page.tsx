'use client';

import { useParams, useRouter } from 'next/navigation';
import { Loader2, ArrowLeft, Coins, Link2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { useRoyaltyPayment } from '@/hooks/useAssets';
import { useEffect } from 'react';

export default function RoyaltyPaymentPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params?.id ? (params.id as string) : null;
  const { payment, loading, error, refetch } = useRoyaltyPayment(paymentId);

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (error || !payment) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/60 border border-red-500/30 rounded-2xl p-6">
          <h2 className="text-xl font-semibold text-red-400 mb-3">Payment not found</h2>
          <p className="text-slate-300 text-sm mb-4">{error || 'Unable to load this payment.'}</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3 text-slate-300 hover:text-slate-50 transition-colors cursor-pointer" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
          <span>Back</span>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-3">
          <div className="flex items-center gap-3 text-amber-400">
            <Coins className="w-6 h-6" />
            <span className="text-sm font-semibold uppercase tracking-wide">Royalty Payment</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Payment #{payment.id}</h1>
          <p className="text-slate-300 text-sm">
            Asset: {payment.asset.title}
          </p>
          <p className="text-slate-300 text-sm">
            Recipient: {payment.recipient.display_name || payment.recipient.wallet_address}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Amount</p>
              <p className="text-2xl font-semibold text-white">{payment.amount}</p>
            </div>
            <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4">
              <p className="text-slate-400 text-sm mb-1">Block</p>
              <p className="text-xl font-semibold text-white">{payment.block_number}</p>
            </div>
          </div>

          <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4 space-y-2">
            <p className="text-slate-400 text-sm">Transaction Hash</p>
            <p className="text-amber-400 break-all">{payment.transaction_hash}</p>
          </div>

          <div className="text-slate-400 text-sm">
            Created: {new Date(payment.created_at).toLocaleString()}
          </div>

          <Button
            variant="outline"
            onClick={() => {
              if (payment.transaction_hash) {
                window.open(`https://explorer.story.foundation/tx/${payment.transaction_hash}`, '_blank');
              }
            }}
            className="flex items-center gap-2"
          >
            <Link2 className="w-4 h-4" />
            View on Explorer
          </Button>
        </div>
      </div>
    </div>
  );
}

