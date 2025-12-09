/**
 * API client with authentication and automatic token refresh
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import DOMPurify from 'dompurify';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Sanitize user data to prevent XSS attacks
function sanitizeUserData(userData: any): any {
  if (!userData || typeof userData !== 'object') return {};
  
  // Define allowed fields (whitelist approach)
  const allowedFields = ['wallet_address', 'username', 'email', 'bio', 'avatar_url', 'banner_url', 'id'];
  
  const sanitized: any = {};
  allowedFields.forEach(field => {
    if (field in userData) {
      // Sanitize string fields to prevent XSS
      if (typeof userData[field] === 'string') {
        sanitized[field] = DOMPurify.sanitize(userData[field]);
      } else {
        sanitized[field] = userData[field];
      }
    }
  });
  
  return sanitized;
}

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
export const tokenManager = {
  getAccessToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  },

  getRefreshToken: (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  },

  setTokens: (access: string, refresh: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },

  clearTokens: (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  setUser: (user: any): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('user', JSON.stringify(user));
  },

  getUser: (): any | null => {
    if (typeof window === 'undefined') return null;
    const user = localStorage.getItem('user');
    const userStr = user || "{}";
    const parsedUser = JSON.parse(userStr);
    return sanitizeUserData(parsedUser);
  },
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenManager.getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for automatic token refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest: any = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return api(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = tokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token, clear everything and reject
        tokenManager.clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      try {
        // Try to refresh the token
        const response = await axios.post(`${API_BASE_URL}/api/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;

        // Update the access token
        tokenManager.setTokens(access, refreshToken);

        // Update the authorization header
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }

        // Process queued requests
        processQueue(null, access);

        isRefreshing = false;

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed, clear tokens and reject
        processQueue(refreshError, null);
        tokenManager.clearTokens();
        isRefreshing = false;

        // Redirect to login or trigger auth state update
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:logout'));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API endpoints
export const authAPI = {
  // Get nonce for SIWE
  getNonce: async (walletAddress: string) => {
    const response = await api.post('/api/auth/nonce/', {
      wallet_address: walletAddress,
    });
    return response.data;
  },

  // Login with SIWE
  login: async (message: string, signature: string) => {
    const response = await api.post('/api/auth/login/', {
      message,
      signature,
    });

    const { access, refresh, user } = response.data;

    // Store tokens and user
    tokenManager.setTokens(access, refresh);
    tokenManager.setUser(user);

    return response.data;
  },

  // Logout
  logout: async () => {
    const refreshToken = tokenManager.getRefreshToken();

    if (refreshToken) {
      try {
        await api.post('/api/auth/logout/', {
          refresh: refreshToken,
        });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }

    tokenManager.clearTokens();
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me/');
    return response.data;
  },

  // Update profile
  updateProfile: async (data: any) => {
    const response = await api.patch('/api/auth/profile/', data);
    tokenManager.setUser(response.data);
    return response.data;
  },

  // Upload avatar image
  uploadAvatar: async (file: File) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.post('/api/auth/profile/avatar/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    tokenManager.setUser(response.data.user);
    return response.data;
  },

  // Upload banner image
  uploadBanner: async (file: File) => {
    const formData = new FormData();
    formData.append('banner', file);
    const response = await api.post('/api/auth/profile/banner/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    tokenManager.setUser(response.data.user);
    return response.data;
  },

  // Get user by wallet address
  getUserByAddress: async (walletAddress: string) => {
    const response = await api.get(`/api/auth/user/${walletAddress}/`);
    return response.data;
  },
};

// IP Assets API endpoints
export const assetsAPI = {
  // Get list of IP assets
  getAssets: async (params?: {
    creator?: number;
    is_derivative?: boolean;
    search?: string;
    page?: number;
    is_deleted?: boolean; // Filter archived assets
    _t?: number; // Cache-busting timestamp (ignored by backend)
  }) => {
    // Remove _t from params before sending (backend doesn't need it)
    const { _t, ...backendParams } = params || {};
    const response = await api.get('/api/assets/assets/', { params: backendParams });
    return response.data;
  },

  // Get single IP asset by UUID
  getAsset: async (id: string) => {
    const response = await api.get(`/api/assets/assets/${id}/`);
    return response.data;
  },

  // Create new IP asset
  createAsset: async (data: FormData) => {
    const response = await api.post('/api/assets/assets/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create derivative of an existing asset (single parent)
  createDerivative: async (data: FormData) => {
    const response = await api.post('/api/assets/assets/create_derivative/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Create multi-parent derivative
  createMultiParentDerivative: async (data: FormData) => {
    const response = await api.post('/api/assets/assets/create_multi_parent_derivative/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Get derivatives of an asset
  getDerivatives: async (id: string) => {
    const response = await api.get(`/api/assets/assets/${id}/derivatives/`);
    return response.data;
  },

  // Claim royalties for an asset
  claimRoyalties: async (id: string) => {
    const response = await api.post(`/api/assets/assets/${id}/claim_royalties/`);
    return response.data;
  },

  // Get royalty balance for an asset
  getRoyaltyBalance: async (id: string) => {
    const response = await api.get(`/api/assets/assets/${id}/royalty_balance/`);
    return response.data;
  },

  // Get royalty payment history
  getRoyaltyPayments: async (page?: number) => {
    const response = await api.get('/api/assets/royalties/', {
      params: { page },
    });
    return response.data;
  },

  // Get royalty payment detail
  getRoyaltyPayment: async (id: string) => {
    const response = await api.get(`/api/assets/royalties/${id}/`);
    return response.data;
  },

  // Update asset (only title and description)
  updateAsset: async (id: string, data: { title: string; description: string }) => {
    const response = await api.patch(`/api/assets/assets/${id}/`, data);
    return response.data;
  },

  // Delete asset (soft delete / archive)
  deleteAsset: async (id: string) => {
    const response = await api.delete(`/api/assets/assets/${id}/`);
    return response.data;
  },

  // Restore archived asset
  restoreAsset: async (id: string) => {
    const response = await api.post(`/api/assets/assets/${id}/restore/`);
    return response.data;
  },

  // Permanently delete asset (must be archived first)
  permanentDeleteAsset: async (id: string) => {
    const response = await api.delete(`/api/assets/assets/${id}/permanent_delete/`);
    return response.data;
  },

  // Retry asset creation (resume from failed step)
  retryCreation: async (id: string) => {
    const response = await api.post(`/api/assets/assets/${id}/retry_creation/`);
    return response.data;
  },

  // Retry Story Protocol registration (legacy endpoint)
  retryRegistration: async (id: string) => {
    const response = await api.post(`/api/assets/assets/${id}/retry_registration/`);
    return response.data;
  },
};

// Collections API endpoints
export const collectionsAPI = {
  // Get list of collections
  getCollections: async (params?: {
    creator?: number;
    is_public?: boolean;
  }) => {
    const response = await api.get('/api/collections/collections/', { params });
    return response.data;
  },

  // Get single collection by UUID
  getCollection: async (id: string) => {
    const response = await api.get(`/api/collections/collections/${id}/`);
    return response.data;
  },

  // Create new collection
  createCollection: async (data: {
    title: string;
    description?: string;
    cover_image_url?: string;
    cover_image?: File;
    is_public?: boolean;
    asset_ids?: string[];  // UUIDs
  }) => {
    // Use FormData if there's a file to upload
    if (data.cover_image) {
      const formData = new FormData();
      formData.append('title', data.title);
      if (data.description) formData.append('description', data.description);
      formData.append('cover_image', data.cover_image);
      if (data.is_public !== undefined) formData.append('is_public', String(data.is_public));
      if (data.asset_ids) {
        data.asset_ids.forEach(id => formData.append('asset_ids', id));
      }
      const response = await api.post('/api/collections/collections/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    // Otherwise use JSON
    const response = await api.post('/api/collections/collections/', data);
    return response.data;
  },

  // Update collection
  updateCollection: async (id: string, data: {
    title?: string;
    description?: string;
    cover_image_url?: string;
    cover_image?: File;
    is_public?: boolean;
    asset_ids?: string[];  // UUIDs
  }) => {
    // Use FormData if there's a file to upload
    if (data.cover_image) {
      const formData = new FormData();
      if (data.title) formData.append('title', data.title);
      if (data.description !== undefined) formData.append('description', data.description);
      formData.append('cover_image', data.cover_image);
      if (data.is_public !== undefined) formData.append('is_public', String(data.is_public));
      if (data.asset_ids) {
        data.asset_ids.forEach(id => formData.append('asset_ids', id));
      }
      const response = await api.patch(`/api/collections/collections/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    }
    // Otherwise use JSON
    const response = await api.patch(`/api/collections/collections/${id}/`, data);
    return response.data;
  },

  // Delete collection
  deleteCollection: async (id: string) => {
    const response = await api.delete(`/api/collections/collections/${id}/`);
    return response.data;
  },

  // Add asset to collection
  addAssetToCollection: async (collectionId: string, assetId: string) => {
    const response = await api.post(`/api/collections/collections/${collectionId}/add_asset/`, {
      asset_id: assetId,
    });
    return response.data;
  },

  // Remove asset from collection
  removeAssetFromCollection: async (collectionId: string, assetId: string) => {
    const response = await api.post(`/api/collections/collections/${collectionId}/remove_asset/`, {
      asset_id: assetId,
    });
    return response.data;
  },
};

// Favorites API endpoints
export const favoritesAPI = {
  // Get user's favorites
  getFavorites: async (userId?: number) => {
    const params = userId ? { user: userId } : {};
    const response = await api.get('/api/collections/favorites/', { params });
    return response.data;
  },

  // Toggle favorite status
  toggleFavorite: async (assetId: string) => {  // UUID
    const response = await api.post('/api/collections/favorites/toggle/', {
      asset_id: assetId,
    });
    return response.data;
  },

  // Check if asset is favorited
  checkFavorite: async (assetId: string) => {  // UUID
    const response = await api.get('/api/collections/favorites/check/', {
      params: { asset_id: assetId },
    });
    return response.data;
  },

  // Remove favorite
  removeFavorite: async (favoriteId: string) => {  // UUID
    const response = await api.delete(`/api/collections/favorites/${favoriteId}/`);
    return response.data;
  },
};

// AI API endpoints
export const aiAPI = {
  // Generate title suggestions from description
  generateTitle: async (data: { description: string; asset_type?: string }) => {
    const response = await api.post('/api/ai/generate-title/', data);
    return response.data;
  },

  // Enhance brief description into detailed narrative
  enhanceDescription: async (data: {
    description: string;
    title?: string;
    asset_type?: string;
  }) => {
    const response = await api.post('/api/ai/enhance-description/', data);
    return response.data;
  },

  // Analyze content and extract categories, tags
  analyzeContent: async (data: {
    title: string;
    description: string;
    media_url?: string;
  }) => {
    const response = await api.post('/api/ai/analyze-content/', data);
    return response.data;
  },

  // Suggest optimal license terms
  suggestLicense: async (data: {
    asset_type: string;
    description: string;
    intended_use?: string;
  }) => {
    const response = await api.post('/api/ai/suggest-license/', data);
    return response.data;
  },

  // Analyze parent-derivative relationship
  analyzeDerivative: async (data: {
    parent_asset_id: string;  // UUID
    derivative_description: string;
    derivative_title?: string;
  }) => {
    const response = await api.post('/api/ai/analyze-derivative/', data);
    return response.data;
  },

  // Get user AI usage statistics
  getUsageStats: async (days = 30) => {
    const response = await api.get('/api/ai/usage-stats/', {
      params: { days }
    });
    return response.data;
  },

  // Get platform-wide AI statistics (admin only)
  getPlatformStats: async (days = 30) => {
    const response = await api.get('/api/ai/platform-stats/', {
      params: { days }
    });
    return response.data;
  },

  // === AI VALIDATION ENDPOINTS (Agent System) ===

  // Run complete pre-mint validation (copyright + quality + pricing)
  validateAsset: async (assetUuid: string) => {
    const response = await api.post(`/api/ai/validate/${assetUuid}/`);
    return response.data;
  },

  // Run copyright detection only
  checkCopyright: async (assetUuid: string) => {
    const response = await api.post(`/api/ai/copyright/${assetUuid}/`);
    return response.data;
  },

  // Run quality analysis only
  analyzeQuality: async (assetUuid: string) => {
    const response = await api.post(`/api/ai/quality/${assetUuid}/`);
    return response.data;
  },

  // Run pricing analysis only
  analyzePricing: async (assetUuid: string) => {
    const response = await api.post(`/api/ai/pricing/${assetUuid}/`);
    return response.data;
  },
};

// Group IP API endpoints
export const groupsAPI = {
  // Get list of groups
  getGroups: async (params?: {
    creator?: string; // wallet address
    is_active?: boolean;
    registration_status?: 'pending' | 'registered' | 'failed';
  }) => {
    const response = await api.get('/api/assets/groups/', { params });
    return response.data;
  },

  // Get single group by UUID
  getGroup: async (id: string) => {
    const response = await api.get(`/api/assets/groups/${id}/`);
    return response.data;
  },

  // Create new group
  createGroup: async (data: {
    name: string;
    description: string;
    total_royalty_percentage: number;
  }) => {
    const response = await api.post('/api/assets/groups/', data);
    return response.data;
  },

  // Update group
  updateGroup: async (id: string, data: {
    name?: string;
    description?: string;
    total_royalty_percentage?: number;
  }) => {
    const response = await api.patch(`/api/assets/groups/${id}/`, data);
    return response.data;
  },

  // Deactivate group
  deleteGroup: async (id: string) => {
    const response = await api.delete(`/api/assets/groups/${id}/`);
    return response.data;
  },

  // Register group on blockchain
  registerGroup: async (id: string, creatorAddress?: string) => {
    const response = await api.post(`/api/assets/groups/${id}/register/`, {
      creator_address: creatorAddress,
    });
    return response.data;
  },

  // Add member to group
  addMember: async (id: string, data: {
    asset_id: string;
    revenue_share_percentage: number;
  }) => {
    const response = await api.post(`/api/assets/groups/${id}/add_member/`, data);
    return response.data;
  },

  // Remove member from group
  removeMember: async (id: string, data: {
    asset_id: string;
  }) => {
    const response = await api.post(`/api/assets/groups/${id}/remove_member/`, data);
    return response.data;
  },

  // Get group statistics
  getStatistics: async (id: string) => {
    const response = await api.get(`/api/assets/groups/${id}/statistics/`);
    return response.data;
  },

  // Get group distributions
  getDistributions: async (id: string) => {
    const response = await api.get(`/api/assets/groups/${id}/distributions/`);
    return response.data;
  },
};

// Dispute API endpoints
export const disputesAPI = {
  // Get list of disputes
  getDisputes: async (params?: {
    target_asset?: string; // UUID
    disputer?: string; // wallet address
    status?: 'pending' | 'under_review' | 'resolved' | 'cancelled';
    result?: 'upheld' | 'rejected' | 'settled';
  }) => {
    const response = await api.get('/api/assets/disputes/', { params });
    return response.data;
  },

  // Get single dispute by UUID
  getDispute: async (id: string) => {
    const response = await api.get(`/api/assets/disputes/${id}/`);
    return response.data;
  },

  // Raise a new dispute
  raiseDispute: async (data: {
    target_asset_uuid: string;
    reason: string;
    evidence_description?: string;
    evidence_url?: string;
  }) => {
    const response = await api.post('/api/assets/disputes/raise_dispute/', data);
    return response.data;
  },

  // Submit evidence
  submitEvidence: async (id: string, data: {
    description: string;
    evidence_url?: string;
  }) => {
    const response = await api.post(`/api/assets/disputes/${id}/submit_evidence/`, data);
    return response.data;
  },

  // Resolve dispute (admin only)
  resolveDispute: async (id: string, data: {
    result: 'upheld' | 'rejected' | 'settled';
    resolution_notes: string;
  }) => {
    const response = await api.post(`/api/assets/disputes/${id}/resolve/`, data);
    return response.data;
  },

  // Cancel dispute (disputer only)
  cancelDispute: async (id: string) => {
    const response = await api.post(`/api/assets/disputes/${id}/cancel/`);
    return response.data;
  },

  // Get dispute evidence
  getEvidence: async (id: string) => {
    const response = await api.get(`/api/assets/disputes/${id}/evidence/`);
    return response.data;
  },

  // Get dispute statistics
  getStatistics: async () => {
    const response = await api.get('/api/assets/disputes/statistics/');
    return response.data;
  },
};

// Permissions API endpoints
export const permissionsAPI = {
  // List permissions for user's assets
  getPermissions: async (params?: {
    asset_uuid?: string;
    permissioned_address?: string;
    permission_type?: 'signer' | 'register_derivative' | 'register_derivative_with_attribution';
    is_active?: boolean;
  }) => {
    const response = await api.get('/api/assets/permissions/', { params });
    return response.data;
  },

  // Get permission details
  getPermission: async (id: string) => {
    const response = await api.get(`/api/assets/permissions/${id}/`);
    return response.data;
  },

  // Set a single permission
  setPermission: async (data: {
    asset_uuid: string;
    permissioned_address: string;
    permission_type: 'signer' | 'register_derivative' | 'register_derivative_with_attribution';
  }) => {
    const response = await api.post('/api/assets/permissions/set_permission/', data);
    return response.data;
  },

  // Set all permissions
  setAllPermissions: async (data: {
    asset_uuid: string;
    permissioned_address: string;
    permissions: {
      signer: boolean;
      register_derivative: boolean;
      register_derivative_with_attribution: boolean;
    };
  }) => {
    const response = await api.post('/api/assets/permissions/set_all_permissions/', data);
    return response.data;
  },

  // Revoke a permission
  revokePermission: async (data: {
    asset_uuid: string;
    permissioned_address: string;
    permission_type: 'signer' | 'register_derivative' | 'register_derivative_with_attribution';
  }) => {
    const response = await api.post('/api/assets/permissions/revoke_permission/', data);
    return response.data;
  },

  // Revoke all permissions
  revokeAllPermissions: async (data: {
    asset_uuid: string;
    permissioned_address: string;
  }) => {
    const response = await api.post('/api/assets/permissions/revoke_all_permissions/', data);
    return response.data;
  },

  // Get permissions for an asset
  getPermissionsForAsset: async (assetUuid: string) => {
    const response = await api.get('/api/assets/permissions/for_asset/', {
      params: { asset_uuid: assetUuid },
    });
    return response.data;
  },

  // Check if address has permission
  checkPermission: async (params: {
    asset_uuid: string;
    permissioned_address: string;
    permission_type: 'signer' | 'register_derivative' | 'register_derivative_with_attribution';
  }) => {
    const response = await api.get('/api/assets/permissions/check_permission/', { params });
    return response.data;
  },

  // Get permission summary
  getPermissionSummary: async (params: {
    asset_uuid: string;
    permissioned_address: string;
  }) => {
    const response = await api.get('/api/assets/permissions/permission_summary/', { params });
    return response.data;
  },
};

// Multi-parent derivative endpoint
export const multiParentDerivativeAPI = {
  // Create derivative with multiple parents
  createMultiParentDerivative: async (data: FormData) => {
    const response = await api.post('/api/assets/assets/create_multi_parent_derivative/', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export default api;
