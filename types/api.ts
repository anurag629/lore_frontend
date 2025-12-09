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
  parent_asset_id: string | null;  // UUID of parent asset (for derivatives)
  royalty_percentage: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  minting_fee: number;  // Minting fee in ETH for derivative creation
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
  parent_asset_id: string | null;  // UUID of parent asset (for derivatives)
  derivative_count: number;
  allow_derivatives: boolean;
  commercial_rights: boolean;
  minting_fee: number;  // Minting fee in ETH for derivative creation
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
  minting_fee?: number;  // Minting fee in ETH (default: 0.005)
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

// Group IP Types
export interface GroupIP {
  id: string;  // alias for uuid
  uuid: string;
  story_group_id: string | null;
  name: string;
  description: string;
  creator: Creator;
  royalty_pool_address: string | null;
  total_royalty_percentage: number;
  member_count: number;
  registration_status: 'pending' | 'registered' | 'failed';
  registration_transaction_hash: string | null;
  is_active: boolean;
  members?: GroupIPMembership[];
  created_at: string;
  updated_at: string;
}

export interface GroupIPMembership {
  id: string;  // alias for uuid
  uuid: string;
  group: string; // Group UUID
  asset: IPAssetListItem;
  asset_id?: string;
  revenue_share_percentage: number;
  is_active: boolean;
  added_at: string;
  removed_at?: string | null;
  transaction_hash?: string | null;
}

export interface GroupIPStatistics {
  group_uuid: string;
  member_count: number;
  total_revenue_share: number;
  total_royalties_received_wei: string;
  total_royalties_received_eth: string;
  distributions_count: number;
  last_distribution_at: string | null;
}

export interface GroupRoyaltyDistribution {
  uuid: string;
  membership: {
    asset: IPAssetListItem;
    revenue_share_percentage: number;
  };
  amount_wei: string;
  amount_eth: string;
  tx_hash: string;
  distributed_at: string;
}

// Dispute Types
export type DisputeStatus = 'pending' | 'under_review' | 'resolved' | 'cancelled';
export type DisputeResult = 'upheld' | 'rejected' | 'settled';

export interface Dispute {
  uuid: string;
  story_dispute_id: string | null;
  target_asset: IPAssetListItem;
  disputer: Creator;
  reason: string;
  evidence_ipfs_hash: string | null;
  status: DisputeStatus;
  result: DisputeResult | null;
  resolution_notes: string | null;
  resolved_by: Creator | null;
  raise_transaction_hash: string | null;
  resolve_transaction_hash: string | null;
  evidence_count: number;
  raised_at: string;
  resolved_at: string | null;
  updated_at: string;
}

export interface DisputeEvidence {
  uuid: string;
  dispute: string; // Dispute UUID
  submitted_by: Creator;
  description: string;
  evidence_url: string | null;
  evidence_ipfs_hash: string | null;
  transaction_hash: string | null;
  submitted_at: string;
}

export interface DisputeStatistics {
  total_disputes: number;
  pending: number;
  under_review: number;
  resolved: number;
  cancelled: number;
  upheld: number;
  rejected: number;
  settled: number;
}

// Permission Types
export type PermissionType = 'execute' | 'transfer_erc20' | 'set_metadata' | 'attach_license' | 'register_derivative' | 'collect_royalty';

export interface IPAccountPermission {
  uuid: string;
  asset: IPAssetListItem;
  grantee_address: string;
  permission_type: PermissionType;
  is_granted: boolean;
  is_active: boolean;
  granted_by: Creator;
  expires_at: string | null;
  notes: string;
  transaction_hash: string;
  created_at: string;
  updated_at: string;
}

export interface PermissionSummary {
  asset_id: string;
  asset_title: string;
  grantee_address: string;
  permissions: {
    execute: boolean;
    transfer_erc20: boolean;
    set_metadata: boolean;
    attach_license: boolean;
    register_derivative: boolean;
    collect_royalty: boolean;
  };
  active_count: number;
  total_count: number;
}

// Multi-Parent Derivative Types
export interface MultiParentDerivativeData {
  parent_assets: Array<{
    parent_asset_id: string;
    attribution_percentage: number;
  }>;
  title: string;
  description: string;
  media_file?: File;
  media_url?: string;
  relationship_type?: 'remix' | 'spin_off' | 'adaptation';
  commercial_rights: boolean;
}

// ============================================================================
// MINTING FEE TYPES
// ============================================================================

/**
 * Breakdown of fee for a single parent asset in a derivative
 */
export interface MintingFeeBreakdown {
  parent_asset_id: string;
  parent_asset_title: string;
  parent_creator: string;
  parent_creator_id: number;
  attribution_percentage: number;
  base_minting_fee: number;
  derivative_count: number;
  popularity_factor: number;
  fee_before_split: number;
  fee_share: number;
  fee_share_wei: string;
}

/**
 * Complete fee calculation result for derivative creation
 */
export interface MintingFeeInfo {
  total_fee: number;
  total_fee_wei: string;
  platform_fee: number;
  creator_fee: number;
  breakdown: MintingFeeBreakdown[];
  is_free: boolean;
}

/**
 * Status of a minting fee payment
 */
export type MintingFeeStatus = 'pending' | 'paid' | 'claimed' | 'failed';

/**
 * Record of a minting fee payment
 */
export interface MintingFeePayment {
  id: string;  // UUID
  payer_username: string;
  payer_id: number;
  derivative_title: string;
  derivative_id: string;
  parent_title: string;
  parent_id: string;
  parent_creator: string;
  parent_creator_id: number;
  fee_amount: number;
  fee_amount_wei: string;
  platform_fee: number;
  creator_fee: number;
  attribution_percentage: number;
  transaction_hash: string | null;
  block_number: number | null;
  status: MintingFeeStatus;
  created_at: string;
  paid_at: string | null;
  claimed_at: string | null;
  is_received?: boolean;  // True if current user is the parent creator (receiving fee)
}

/**
 * Fee statistics for a user
 */
export interface MintingFeeStats {
  total_earned: number;
  total_unclaimed: number;
  total_claimed: number;
  payment_count: number;
  fees_paid_as_creator: number;
  fees_paid_count: number;
  assets_with_fees: AssetFeeInfo[];
}

/**
 * Fee information for a single asset
 */
export interface AssetFeeInfo {
  id: string;  // UUID
  title: string;
  thumbnail: string;
  minting_fee: number;
  derivative_count: number;
  unclaimed_amount: number;
  total_earned: number;
  fee_payment_count: number;
}

/**
 * Response when claiming minting fees
 */
export interface ClaimMintingFeesResponse {
  claimed_amount: number;
  claimed_count: number;
  asset_id: string;
  new_total_earnings: number;
}

/**
 * Minting fee balance for an asset
 */
export interface MintingFeeBalance {
  asset_id: string;
  asset_title: string;
  unclaimed_amount: number;
  unclaimed_count: number;
  minting_fee_setting: number;
}
