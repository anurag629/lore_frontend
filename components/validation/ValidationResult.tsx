'use client';

import { ValidationWorkflowResult } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Shield,
  Star,
  DollarSign,
  Clock,
  TrendingUp
} from 'lucide-react';

interface ValidationResultProps {
  result: ValidationWorkflowResult;
  compact?: boolean;
}

export function ValidationResult({ result, compact = false }: ValidationResultProps) {
  const getVerdictIcon = () => {
    switch (result.overall_verdict) {
      case 'approved':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getVerdictColor = () => {
    switch (result.overall_verdict) {
      case 'approved':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'rejected':
        return 'bg-red-50 border-red-200';
    }
  };

  const getVerdictText = () => {
    switch (result.overall_verdict) {
      case 'approved':
        return 'Approved for Minting';
      case 'warning':
        return 'Approved with Warnings';
      case 'rejected':
        return 'Not Recommended for Minting';
    }
  };

  if (compact) {
    return (
      <div className={`p-4 rounded-lg border ${getVerdictColor()}`}>
        <div className="flex items-center gap-2">
          {getVerdictIcon()}
          <span className="font-medium">{getVerdictText()}</span>
        </div>
        {result.warnings.length > 0 && (
          <div className="mt-2 space-y-1">
            {result.warnings.map((warning, i) => (
              <p key={i} className="text-sm text-gray-600">{warning}</p>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Verdict */}
      <Alert className={getVerdictColor()}>
        <div className="flex items-start gap-4">
          {getVerdictIcon()}
          <div className="flex-1">
            <AlertTitle className="text-lg font-semibold mb-2">
              {getVerdictText()}
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <span>Completed in {result.total_time.toFixed(2)}s</span>
                <Badge variant="secondary">
                  {result.steps_completed.length} checks completed
                </Badge>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>

      {/* Blockers */}
      {result.blockers.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>Critical Issues Found</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {result.blockers.map((blocker, i) => (
                <li key={i} className="text-sm">{blocker}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Warnings */}
      {result.warnings.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Recommendations</AlertTitle>
          <AlertDescription>
            <ul className="mt-2 space-y-1">
              {result.warnings.map((warning, i) => (
                <li key={i} className="text-sm">{warning}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Copyright Analysis */}
      {result.analysis.copyright && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Copyright Analysis</CardTitle>
              </div>
              <Badge
                variant={
                  result.analysis.copyright.risk_level === 'low'
                    ? 'default'
                    : result.analysis.copyright.risk_level === 'medium'
                    ? 'secondary'
                    : 'destructive'
                }
              >
                {result.analysis.copyright.risk_level.toUpperCase()} RISK
              </Badge>
            </div>
            <CardDescription>
              Confidence: {(result.analysis.copyright.confidence * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Similarity Score</span>
                <span className="font-medium">
                  {(result.analysis.copyright.similarity_score * 100).toFixed(1)}%
                </span>
              </div>
              <Progress
                value={result.analysis.copyright.similarity_score * 100}
                className="h-2"
              />
            </div>

            {result.analysis.copyright.potential_matches.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Similar Assets Found</h4>
                <div className="space-y-2">
                  {result.analysis.copyright.potential_matches.slice(0, 3).map((match, i) => (
                    <div key={i} className="flex justify-between text-sm p-2 bg-gray-50 rounded">
                      <span className="truncate">{match.asset_title}</span>
                      <span className="text-gray-600">
                        {(match.similarity_score * 100).toFixed(0)}% similar
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium mb-2">Recommendations</h4>
              <ul className="space-y-1">
                {result.analysis.copyright.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-gray-600">{rec}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quality Analysis */}
      {result.analysis.quality && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <CardTitle>Quality Analysis</CardTitle>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold">
                  {result.analysis.quality.overall_score.toFixed(1)}
                </div>
                <div className="text-xs text-gray-500">out of 100</div>
              </div>
            </div>
            <CardDescription>
              Confidence: {(result.analysis.quality.confidence * 100).toFixed(0)}%
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600 mb-1">Technical Quality</div>
                <Progress
                  value={result.analysis.quality.technical_quality.overall_score}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {result.analysis.quality.technical_quality.overall_score.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Description Quality</div>
                <Progress
                  value={result.analysis.quality.description_quality.overall_score}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {result.analysis.quality.description_quality.overall_score.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Metadata Completeness</div>
                <Progress
                  value={result.analysis.quality.metadata_completeness}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {result.analysis.quality.metadata_completeness.toFixed(0)}%
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600 mb-1">Market Appeal</div>
                <Progress
                  value={result.analysis.quality.market_appeal}
                  className="h-2"
                />
                <div className="text-xs text-gray-500 mt-1">
                  {result.analysis.quality.market_appeal.toFixed(0)}%
                </div>
              </div>
            </div>

            {result.analysis.quality.strengths.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2 text-green-700">Strengths</h4>
                <ul className="space-y-1">
                  {result.analysis.quality.strengths.map((strength, i) => (
                    <li key={i} className="text-sm text-gray-600">✓ {strength}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.analysis.quality.improvement_suggestions.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Improvements</h4>
                <ul className="space-y-1">
                  {result.analysis.quality.improvement_suggestions.map((suggestion, i) => (
                    <li key={i} className="text-sm text-gray-600">{suggestion}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Pricing Analysis */}
      {result.analysis.pricing && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              <CardTitle>Pricing Recommendations</CardTitle>
            </div>
            <CardDescription>
              Based on {result.analysis.pricing.similar_assets_count} similar assets
              {result.analysis.pricing.quality_score_used &&
                ` • Quality Score: ${result.analysis.pricing.quality_score_used.toFixed(0)}/100`
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              {result.analysis.pricing.suggested_tiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`p-4 rounded-lg border ${
                    tier.tier === 'balanced'
                      ? 'border-blue-300 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-xs font-medium text-gray-500 uppercase mb-1">
                      {tier.tier}
                      {tier.tier === 'balanced' && (
                        <Badge variant="default" className="ml-2">Recommended</Badge>
                      )}
                    </div>
                    <div className="text-3xl font-bold text-gray-900">
                      {tier.royalty_percentage}%
                    </div>
                    <p className="text-xs text-gray-600 mt-2">
                      {tier.description.split('.')[0]}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-gray-500" />
              <span className="text-gray-600">
                Market Average: {result.analysis.pricing.market_average.toFixed(1)}%
              </span>
              <span className="text-gray-400">•</span>
              <span className="text-gray-600">
                Demand Prediction: {result.analysis.pricing.demand_prediction.toFixed(0)}/100
              </span>
            </div>

            <div className="text-sm text-gray-600">
              <strong>Analysis:</strong> {result.analysis.pricing.reasoning}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Time */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock className="h-4 w-4" />
        <span>Analysis completed in {result.total_time.toFixed(2)} seconds</span>
      </div>
    </div>
  );
}
