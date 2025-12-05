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
