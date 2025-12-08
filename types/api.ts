/**
 * TypeScript types for API responses
 * Note: IDs are UUIDs (strings) for all entities except User (which uses wallet_address)
 */

export interface User {
  id: number;  // Internal ID - frontend uses wallet_address for identification
  wallet_address: string;
  username: string;
  email: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  banner_url?: string;
  total_earnings: string;
  assets_count: number;
  total_spinoffs: number;
  is_active: boolean;
  is_staff?: boolean;
  created_at: string;
}

export interface Creator {
  id: number;  // Internal ID
  wallet_address: string;
  display_name: string;
  avatar_url: string;
}

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
  creator: Creator;
  title: string;
  description: string;
  media_url: string;
  metadata_hash: string;
  is_derivative: boolean;
  parent_asset?: IPAsset | null;
  royalty_percentage: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  derivative_count: number;
  derivatives?: IPAsset[];
  registration_status?: 'pending' | 'registered' | 'failed' | 'retrying';
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
  updated_at: string;
}

export interface IPAssetListItem {
  id: string;  // UUID
  story_ip_id: string | null;
  creator: Creator;
  title: string;
  description: string;
  media_url: string;
  is_derivative: boolean;
  derivative_count: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  registration_status?: 'pending' | 'registered' | 'failed' | 'retrying';
  registration_error?: string;
  is_deleted?: boolean;
  deleted_at?: string | null;
  created_at: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateIPAssetData {
  title: string;
  description: string;
  media_file?: File;
  media_url?: string;
  royalty_percentage: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
}

export interface CreateDerivativeData {
  parent_asset_id: string;  // UUID
  title: string;
  description: string;
  media_file?: File;
  media_url?: string;
  commercial_rights: boolean;
}

export interface RoyaltyPayment {
  id: string;  // UUID
  asset: IPAssetListItem;
  recipient: Creator;
  amount: string;
  transaction_hash: string;
  block_number: number;
  created_at: string;
}

export interface RoyaltyBalance {
  balance: string;
  asset_id: string;  // UUID
  story_ip_id: string;
}

export interface ClaimRoyaltiesResponse {
  message: string;
  amount: string;
  transaction_hash: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
  user: User;
}

export interface NonceResponse {
  nonce: string;
  message: string;
  domain: string;
  uri: string;
  statement: string;
}

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}
