/**
 * API client with authentication and automatic token refresh
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

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
    return user ? JSON.parse(user) : null;
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
  }) => {
    const response = await api.get('/api/assets/assets/', { params });
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

  // Create derivative of an existing asset
  createDerivative: async (data: FormData) => {
    const response = await api.post('/api/assets/assets/create_derivative/', data, {
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

  // Update asset (only title and description)
  updateAsset: async (id: string, data: { title: string; description: string }) => {
    const response = await api.patch(`/api/assets/assets/${id}/`, data);
    return response.data;
  },

  // Delete asset (soft delete)
  deleteAsset: async (id: string) => {
    const response = await api.delete(`/api/assets/assets/${id}/`);
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
    is_public?: boolean;
    asset_ids?: string[];  // UUIDs
  }) => {
    const response = await api.post('/api/collections/collections/', data);
    return response.data;
  },

  // Update collection
  updateCollection: async (id: string, data: {
    title?: string;
    description?: string;
    cover_image_url?: string;
    is_public?: boolean;
    asset_ids?: string[];  // UUIDs
  }) => {
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
};

export default api;
