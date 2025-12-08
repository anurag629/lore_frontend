/**
 * Lore TypeScript Type Definitions
 * Note: IDs are UUIDs (strings) for entities. User uses wallet_address for public identification.
 */

// User Types
export interface LoreUser {
  id: number;  // Internal ID
  wallet_address: string;
  username: string;
  bio: string;
  avatar_url: string;
  total_earnings: string;
  created_at: string;
}

// IP Asset Types
export type CreationStep = 
  | 'media_upload'
  | 'db_save'
  | 'metadata_upload'
  | 'story_registration'
  | 'license_attachment'
  | 'completed';

export interface IPAsset {
  id: string;  // UUID
  story_ip_id: string | null;
  creator: LoreUser;
  title: string;
  description: string;
  media_url: string;
  metadata_hash: string;
  is_derivative: boolean;
  parent_asset: string | null;  // UUID
  royalty_percentage: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  registration_status: 'pending' | 'registered' | 'failed' | 'retrying';
  registration_error?: string;
  registration_attempts?: number;
  last_registration_attempt?: string;
  creation_step?: CreationStep;
  failed_at_step?: CreationStep;
  step_data?: {
    media_upload?: {
      ipfs_hash?: string;
      url?: string;
    };
    metadata_upload?: {
      uri?: string;
      hash?: string;
      ipfs_hash?: string;
    };
    story_registration?: {
      ip_id?: string;
      transaction_hash?: string;
      block_number?: number;
    };
    license_attachment?: {
      attached?: boolean;
      error?: string;
    };
  };
  created_at: string;
  updated_at?: string;
}

// Interaction Types
export type InteractionType = 'like' | 'spinoff' | 'view';

export interface Interaction {
  id: string;  // UUID
  user: number;
  asset: string;  // UUID
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
  id: string;  // UUID
  asset: string;  // UUID
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

// AI Validation Types (Agent System)
export interface CopyrightAnalysisResult {
  risk_level: 'low' | 'medium' | 'high';
  similarity_score: number;
  is_likely_original: boolean;
  potential_matches: Array<{
    asset_id: number;
    asset_title: string;
    asset_creator: string;
    similarity_score: number;
    match_type: 'image' | 'text';
    hamming_distance?: number;
  }>;
  recommendations: string[];
  confidence: number;
  analysis_details?: {
    total_matches_found: number;
    image_analysis_performed: boolean;
    text_analysis_performed: boolean;
  };
}

export interface QualityAnalysisResult {
  overall_score: number;
  technical_quality: {
    overall_score: number;
    has_image: boolean;
    resolution_score: number;
    sharpness_score: number;
    noise_score: number;
    width?: number;
    height?: number;
    megapixels?: number;
    laplacian_variance?: number;
    noise_estimate?: number;
  };
  description_quality: {
    overall_score: number;
    length_score: number;
    clarity_score: number;
    seo_score: number;
    word_count: number;
    reading_ease?: number;
  };
  metadata_completeness: number;
  market_appeal: number;
  improvement_suggestions: string[];
  strengths: string[];
  confidence: number;
}

export interface PricingTier {
  tier: 'conservative' | 'balanced' | 'aggressive';
  royalty_percentage: number;
  description: string;
}

export interface PricingAnalysisResult {
  suggested_tiers: PricingTier[];
  market_average: number;
  similar_assets_count: number;
  demand_prediction: number;
  reasoning: string;
  confidence: number;
  quality_score_used?: number;
}

export interface ValidationWorkflowResult {
  success: boolean;
  workflow_status: 'pending' | 'running' | 'completed' | 'failed';
  overall_verdict: 'approved' | 'warning' | 'rejected';
  steps_completed: string[];
  warnings: string[];
  blockers: string[];
  total_time: number;
  analysis: {
    copyright?: CopyrightAnalysisResult;
    quality?: QualityAnalysisResult;
    pricing?: PricingAnalysisResult;
  };
}

// Comment Types
export interface Comment {
  id: string;  // UUID
  asset: string;  // UUID
  user: {
    id: number;
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
  parent: string | null;  // UUID
  content: string;
  reply_count: number;
  is_deleted: boolean;
  is_own_comment: boolean;
  is_liked: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
}

export interface CommentCreate {
  asset: string;  // UUID
  parent?: string | null;  // UUID
  content: string;
}

export interface CommentUpdate {
  content: string;
}

// Collection Types
export interface Collection {
  id: string;  // UUID
  title: string;
  description: string;
  creator: {
    id: number;
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
  cover_image_url: string | null;
  is_public: boolean;
  asset_count: number;
  assets?: IPAsset[];
  created_at: string;
  updated_at: string;
}

export interface CollectionCreate {
  title: string;
  description?: string;
  cover_image_url?: string;
  is_public?: boolean;
  asset_ids?: string[];  // UUIDs
}

export interface CollectionUpdate {
  title?: string;
  description?: string;
  cover_image_url?: string;
  is_public?: boolean;
  asset_ids?: string[];  // UUIDs
}

// Favorite Types
export interface Favorite {
  id: string;  // UUID
  user: {
    id: number;
    wallet_address: string;
    display_name: string;
    avatar_url: string;
  };
  asset: IPAsset;
  created_at: string;
}

export interface FavoriteCreate {
  asset_id: string;  // UUID
}
