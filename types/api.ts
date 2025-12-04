/**
 * TypeScript types for API responses
 */

export interface User {
  id: number;
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
  id: number;
  wallet_address: string;
  display_name: string;
  avatar_url: string;
}

export interface IPAsset {
  id: number;
  story_ip_id: string;
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
  created_at: string;
  updated_at: string;
}

export interface IPAssetListItem {
  id: number;
  story_ip_id: string;
  creator: Creator;
  title: string;
  description: string;
  media_url: string;
  is_derivative: boolean;
  derivative_count: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
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
  parent_asset_id: number;
  title: string;
  description: string;
  media_file?: File;
  media_url?: string;
  commercial_rights: boolean;
}

export interface RoyaltyPayment {
  id: number;
  asset: IPAssetListItem;
  recipient: Creator;
  amount: string;
  transaction_hash: string;
  block_number: number;
  created_at: string;
}

export interface RoyaltyBalance {
  balance: string;
  asset_id: number;
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
