/**
 * React hooks for AI features using React Query
 */
'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { aiAPI } from '@/lib/api';
import type {
  AITitleResponse,
  AIDescriptionResponse,
  AIAnalysisResponse,
  AILicenseResponse,
  AIDerivativeResponse,
  AIUsageStats,
  AIPlatformStats,
  ValidationWorkflowResult,
  CopyrightAnalysisResult,
  QualityAnalysisResult,
  PricingAnalysisResult,
} from '@/lib/types';

/**
 * Hook to generate title suggestions from description
 */
export function useGenerateTitle() {
  return useMutation<
    AITitleResponse,
    Error,
    { description: string; asset_type?: string }
  >({
    mutationFn: aiAPI.generateTitle,
  });
}

/**
 * Hook to enhance brief description into detailed narrative
 */
export function useEnhanceDescription() {
  return useMutation<
    AIDescriptionResponse,
    Error,
    { description: string; title?: string; asset_type?: string }
  >({
    mutationFn: aiAPI.enhanceDescription,
  });
}

/**
 * Hook to analyze content and extract metadata
 */
export function useAnalyzeContent() {
  return useMutation<
    AIAnalysisResponse,
    Error,
    { title: string; description: string; media_url?: string }
  >({
    mutationFn: aiAPI.analyzeContent,
  });
}

/**
 * Hook to get license suggestions
 */
export function useSuggestLicense() {
  return useMutation<
    AILicenseResponse,
    Error,
    { asset_type: string; description: string; intended_use?: string }
  >({
    mutationFn: aiAPI.suggestLicense,
  });
}

/**
 * Hook to analyze derivative similarity
 */
export function useAnalyzeDerivative() {
  return useMutation<
    AIDerivativeResponse,
    Error,
    { parent_asset_id: string; derivative_description: string; derivative_title?: string }
  >({
    mutationFn: aiAPI.analyzeDerivative,
  });
}

/**
 * Hook to get user AI usage statistics
 */
export function useAIUsageStats(days = 30) {
  return useQuery<AIUsageStats, Error>({
    queryKey: ['ai-usage-stats', days],
    queryFn: () => aiAPI.getUsageStats(days),
  });
}

/**
 * Hook to get platform-wide AI statistics (admin only)
 */
export function useAIPlatformStats(days = 30) {
  return useQuery<AIPlatformStats, Error>({
    queryKey: ['ai-platform-stats', days],
    queryFn: () => aiAPI.getPlatformStats(days),
  });
}

// === AI VALIDATION HOOKS (Agent System) ===

/**
 * Hook to run complete pre-mint validation
 * Runs copyright detection, quality analysis, and pricing recommendations
 */
export function useValidateAsset() {
  return useMutation<ValidationWorkflowResult, Error, string>({
    mutationFn: aiAPI.validateAsset,
  });
}

/**
 * Hook to run copyright detection only
 */
export function useCopyrightCheck() {
  return useMutation<CopyrightAnalysisResult, Error, string>({
    mutationFn: aiAPI.checkCopyright,
  });
}

/**
 * Hook to run quality analysis only
 */
export function useQualityAnalysis() {
  return useMutation<QualityAnalysisResult, Error, string>({
    mutationFn: aiAPI.analyzeQuality,
  });
}

/**
 * Hook to run pricing analysis only
 */
export function usePricingAnalysis() {
  return useMutation<PricingAnalysisResult, Error, string>({
    mutationFn: aiAPI.analyzePricing,
  });
}
