'use client';

import { ValidationWorkflowResult } from '@/lib/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Star,
  DollarSign,
  Clock,
  TrendingUp,
} from 'lucide-react';

interface ValidationResultProps {
  result: ValidationWorkflowResult;
  compact?: boolean;
}

export function ValidationResult({ result, compact = false }: ValidationResultProps) {
  const verdict = (() => {
    switch (result.overall_verdict) {
      case 'approved':
        return { text: 'Approved for Minting', icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, color: 'border-green-500/40 bg-green-500/5' };
      case 'warning':
        return { text: 'Approved with Warnings', icon: <AlertTriangle className="h-5 w-5 text-amber-500" />, color: 'border-amber-500/40 bg-amber-500/5' };
      case 'rejected':
      default:
        return { text: 'Not Recommended for Minting', icon: <XCircle className="h-5 w-5 text-red-500" />, color: 'border-red-500/40 bg-red-500/5' };
    }
  })();

  if (compact) {
    return (
      <div className={`p-4 rounded-lg border ${verdict.color}`}>
        <div className="flex items-center gap-2">
          {verdict.icon}
          <span className="font-medium text-white">{verdict.text}</span>
        </div>
        {result.warnings.length > 0 && (
          <ul className="mt-2 space-y-1 text-sm text-slate-400">
            {result.warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 text-white">
      {/* Verdict */}
      <div className={`p-5 rounded-2xl border ${verdict.color}`}>
        <div className="flex items-start gap-3">
          {verdict.icon}
          <div>
            <div className="text-lg font-semibold">{verdict.text}</div>
            <div className="text-sm text-slate-400">
              Completed in {result.total_time.toFixed(2)}s • {result.steps_completed.length} checks
            </div>
          </div>
        </div>
      </div>

      {/* Blockers */}
      {result.blockers.length > 0 && (
        <div className="p-4 rounded-xl border border-red-500/30 bg-red-500/5">
          <div className="flex items-center gap-2 text-red-400 font-semibold mb-2">
            <XCircle className="h-4 w-4" />
            Critical Issues Found
          </div>
          <ul className="space-y-1 text-sm text-red-200">
            {result.blockers.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center gap-2 text-amber-300 font-semibold mb-2">
            <AlertTriangle className="h-4 w-4" />
            Recommendations
          </div>
          <ul className="space-y-1 text-sm text-amber-100">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Analysis Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Copyright */}
        {result.analysis.copyright && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Shield className="h-5 w-5" /> Copyright Analysis
            </div>
            <div className="text-sm text-slate-400">
              Risk: <span className="font-semibold text-white">{result.analysis.copyright.risk_level}</span> • Confidence:{' '}
              {(result.analysis.copyright.confidence * 100).toFixed(0)}%
            </div>
            <div className="text-sm text-slate-300">
              Similarity: {(result.analysis.copyright.similarity_score * 100).toFixed(1)}%
            </div>
            {result.analysis.copyright.recommendations.length > 0 && (
              <ul className="text-sm text-slate-400 space-y-1">
                {result.analysis.copyright.recommendations.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Quality */}
        {result.analysis.quality && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <Star className="h-5 w-5" /> Quality Analysis
            </div>
            <div className="text-2xl font-bold">{result.analysis.quality.overall_score.toFixed(1)}</div>
            <div className="text-sm text-slate-400">
              Technical: {result.analysis.quality.technical_quality.overall_score.toFixed(1)} • Description:{' '}
              {result.analysis.quality.description_quality.overall_score.toFixed(1)}
            </div>
            <div className="text-sm text-slate-400">
              Metadata completeness: {result.analysis.quality.metadata_completeness.toFixed(1)} • Market appeal:{' '}
              {result.analysis.quality.market_appeal.toFixed(1)}
            </div>
            {result.analysis.quality.improvement_suggestions.length > 0 && (
              <ul className="text-sm text-slate-400 space-y-1">
                {result.analysis.quality.improvement_suggestions.map((rec, i) => (
                  <li key={i}>• {rec}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Pricing */}
        {result.analysis.pricing && (
          <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-2">
            <div className="flex items-center gap-2 font-semibold">
              <TrendingUp className="h-5 w-5" /> Pricing Recommendation
            </div>
            <div className="text-lg font-semibold">
              {result.analysis.pricing.suggested_tiers[0]?.royalty_percentage ?? '--'}% ({result.analysis.pricing.suggested_tiers[0]?.tier || 'tier'})
            </div>
            <div className="text-sm text-slate-400">
              Market avg: {result.analysis.pricing.market_average.toFixed(1)}% • Demand score:{' '}
              {result.analysis.pricing.demand_prediction.toFixed(1)}
            </div>
            <div className="text-sm text-slate-400">
              Confidence: {(result.analysis.pricing.confidence * 100).toFixed(0)}%
            </div>
            {result.analysis.pricing.reasoning && (
              <ul className="text-sm text-slate-400 space-y-1">
                <li>• {result.analysis.pricing.reasoning}</li>
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Timeline */}
      <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/60 space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          <Clock className="h-5 w-5" /> Workflow Timeline
        </div>
        <div className="space-y-2">
          {result.steps_completed.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-500/10 border border-amber-500/40 flex items-center justify-center text-sm text-amber-200">
                {i + 1}
              </div>
              <div>
                <div className="font-medium">{step}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

