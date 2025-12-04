/**
 * Lore TypeScript Type Definitions
 */

// User Types
export interface LoreUser {
  id: number;
  wallet_address: string;
  username: string;
  bio: string;
  avatar_url: string;
  total_earnings: string;
  created_at: string;
}

// IP Asset Types
export interface IPAsset {
  id: number;
  story_ip_id: string | null;
  creator: LoreUser;
  title: string;
  description: string;
  media_url: string;
  metadata_hash: string;
  is_derivative: boolean;
  parent_asset: number | null;
  royalty_percentage: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  created_at: string;
}

// Interaction Types
export type InteractionType = 'like' | 'spinoff' | 'view';

export interface Interaction {
  id: number;
  user: number;
  asset: number;
  type: InteractionType;
  created_at: string;
}

// Dashboard Types
export interface DashboardMetrics {
  total_earnings: string;
  assets_minted: number;
  total_spinoffs: number;
  audience_reach: number;
  earnings_trend: number; // percentage change
}

export interface AssetPerformance {
  asset: IPAsset;
  spinoff_count: number;
  revenue: string;
  status: 'live' | 'pending';
  views: number;
}

// Royalty Types
export interface RoyaltyPayment {
  id: number;
  asset: number;
  recipient: number;
  amount: string;
  transaction_hash: string;
  block_number: number;
  created_at: string;
}

// API Response Types
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Form Types
export interface MintFormData {
  title: string;
  description: string;
  file: File | null;
  allow_derivatives: boolean;
  royalty_percentage: number;
  commercial_rights: boolean;
}

// Web3 Types
export interface StoryProtocolConfig {
  chainId: number;
  rpcUrl: string;
  contracts: {
    ipAssetRegistry: `0x${string}`;
    licensingModule: `0x${string}`;
    royaltyModule: `0x${string}`;
  };
}

// AI Response Types
export interface AITitleResponse {
  titles: string[];
  model_used: string;
  log_id: number;
}

export interface AIDescriptionResponse {
  enhanced_description: string;
  model_used: string;
  log_id: number;
}

export interface AIAnalysisResponse {
  category: string;
  tags: string[];
  art_style: string | null;
  theme: string | null;
  genre: string | null;
  model_used: string;
  log_id: number;
}

export interface AILicenseResponse {
  royalty_percentage: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  reasoning: string;
  model_used: string;
  log_id: number;
}

export interface AIDerivativeResponse {
  similarity_score: number;
  transformation_type: string;
  suggested_attribution: string;
  key_differences: string[];
  model_used: string;
  log_id: number;
}

export interface AIUsageStats {
  total_requests: number;
  by_operation: { operation_type: string; count: number }[];
  success_rate: number;
  cache_hit_rate: number;
  avg_response_time: number;
  total_tokens: number;
  accepted_suggestions: number;
  by_content_type: { content_type: string; count: number }[];
}

export interface AIPlatformStats extends AIUsageStats {
  unique_users: number;
  by_model: { model_used: string; count: number }[];
  rate_limited_requests: number;
  acceptance_rate: number;
}

// Comment Types
export interface Comment {
  id: number;
  asset: number;
  user: {
    id: number;
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
  parent: number | null;
  content: string;
  reply_count: number;
  is_deleted: boolean;
  is_own_comment: boolean;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  asset: number;
  parent?: number | null;
  content: string;
}

export interface CommentUpdate {
  content: string;
}
