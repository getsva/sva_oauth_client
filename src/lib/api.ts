// API Configuration and Base Service

// Ensure API_BASE_URL doesn't have trailing slash and is correctly formatted
let apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001/api/auth';
apiBaseUrl = apiBaseUrl.replace(/\/+$/, ''); // Remove all trailing slashes
// Ensure it ends with /api/auth
if (!apiBaseUrl.endsWith('/api/auth')) {
  apiBaseUrl = apiBaseUrl.replace(/\/api\/?$/, '') + '/api/auth';
}
const API_BASE_URL = apiBaseUrl;

// Token management
export const tokenService = {
  getAccessToken: (): string | null => {
    return localStorage.getItem('access_token');
  },
  getRefreshToken: (): string | null => {
    return localStorage.getItem('refresh_token');
  },
  setTokens: (access: string, refresh: string): void => {
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);
  },
  clearTokens: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },
  getUser: (): any | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
  setUser: (user: any): void => {
    localStorage.setItem('user', JSON.stringify(user));
  },
};

// API Error class
export class APIError extends Error {
  constructor(
    public status: number,
    public data: any,
    message?: string
  ) {
    super(message || `API Error: ${status}`);
    this.name = 'APIError';
  }
}

// Token refresh interceptor for automatic token refresh on 401
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: any) => void;
  reject: (error: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Enhanced API request with automatic token refresh
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  let token = tokenService.getAccessToken();

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    let response = await fetch(url, config);
    const data = await response.json();

    // If 401 and we have a refresh token, try to refresh
    if (response.status === 401 && tokenService.getRefreshToken()) {
      if (isRefreshing) {
        // If already refreshing, queue this request
        return new Promise<T>((resolve, reject) => {
          failedQueue.push({ 
            resolve: (val) => resolve(apiRequest<T>(endpoint, options)), 
            reject 
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = tokenService.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const refreshResponse = await fetch(`${API_BASE_URL}/token/refresh/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ refresh: refreshToken }),
        });

        if (!refreshResponse.ok) {
          throw new Error('Token refresh failed');
        }

        const refreshData = await refreshResponse.json();
        tokenService.setTokens(refreshData.access, refreshToken);
        token = refreshData.access;

        // Update headers with new token
        headers['Authorization'] = `Bearer ${token}`;
        config.headers = headers;

        // Retry original request
        response = await fetch(url, config);
        const retryData = await response.json();

        processQueue(null, token);
        isRefreshing = false;

        if (!response.ok) {
          throw new APIError(response.status, retryData, retryData.message || 'Request failed');
        }

        return retryData;
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        tokenService.clearTokens();
        throw new APIError(401, {}, 'Session expired. Please login again.');
      }
    }

    if (!response.ok) {
      throw new APIError(response.status, data, data.message || 'Request failed');
    }

    return data;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    throw new APIError(500, {}, 'Network error or server unavailable');
  }
}

// API Service
export const api = {
  // Authentication
  register: async (data: {
    email: string;
    first_name?: string;
    last_name?: string;
    password: string;
    password2: string;
  }) => {
    return apiRequest<{ message: string; user: any }>('/register/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  login: async (data: { email: string; password: string }) => {
    return apiRequest<{
      message: string;
      user: any;
      tokens: { access: string; refresh: string };
    }>('/login/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  verifyEmail: async (token: string) => {
    return apiRequest<{
      message: string;
      user: any;
      tokens: { access: string; refresh: string };
    }>('/verify-email/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  resendVerification: async (email: string) => {
    return apiRequest<{ message: string }>('/resend-verification/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // User Profile
  getProfile: async () => {
    return apiRequest<any>('/profile/');
  },

  updateProfile: async (data: { first_name?: string; last_name?: string }) => {
    return apiRequest<{ message: string; user: any }>('/profile/update/', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // OAuth
  googleLogin: async (accessToken: string) => {
    return apiRequest<{
      user: any;
      tokens: { access: string; refresh: string };
    }>('/google/', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  },

  githubLogin: async (accessToken: string) => {
    return apiRequest<{
      user: any;
      tokens: { access: string; refresh: string };
    }>('/github/', {
      method: 'POST',
      body: JSON.stringify({ access_token: accessToken }),
    });
  },


  // Token Refresh
  refreshToken: async (refreshToken: string) => {
    return apiRequest<{ access: string }>('/token/refresh/', {
      method: 'POST',
      body: JSON.stringify({ refresh: refreshToken }),
    });
  },

  // Credentials - OAuth Apps
  getOAuthApps: async () => {
    const response = await apiRequest<any>('/credentials/oauth-apps/');
    // Handle paginated response or direct array
    return Array.isArray(response) ? response : (response.results || []);
  },

  createOAuthApp: async (data: {
    name: string;
    app_type?: 'web' | 'mobile' | 'desktop';
    redirect_uris?: string;
    redirect_uris_list?: string[];
  }) => {
    return apiRequest<any>('/credentials/oauth-apps/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getOAuthApp: async (id: number) => {
    return apiRequest<any>(`/credentials/oauth-apps/${id}/`);
  },

  updateOAuthApp: async (id: number, data: {
    name?: string;
    app_type?: 'web' | 'mobile' | 'desktop';
    redirect_uris?: string;
    redirect_uris_list?: string[];
  }) => {
    return apiRequest<any>(`/credentials/oauth-apps/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteOAuthApp: async (id: number) => {
    return apiRequest<{ message: string }>(`/credentials/oauth-apps/${id}/`, {
      method: 'DELETE',
    });
  },

  restoreOAuthApp: async (id: number) => {
    return apiRequest<any>(`/credentials/oauth-apps/${id}/restore/`, {
      method: 'POST',
    });
  },

  getDeletedOAuthApps: async () => {
    const response = await apiRequest<any>('/credentials/oauth-apps/deleted/');
    // Handle paginated response or direct array
    return Array.isArray(response) ? response : (response.results || []);
  },

  // Credentials - API Keys
  getAPIKeys: async () => {
    const response = await apiRequest<any>('/credentials/api-keys/');
    // Handle paginated response or direct array
    return Array.isArray(response) ? response : (response.results || []);
  },

  createAPIKey: async (data: {
    name: string;
    key_type?: 'server' | 'browser';
    bound_account?: string;
    restrictions?: string;
    restrictions_dict?: Record<string, any>;
  }) => {
    return apiRequest<any>('/credentials/api-keys/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAPIKey: async (id: number) => {
    return apiRequest<any>(`/credentials/api-keys/${id}/`);
  },

  showAPIKey: async (id: number) => {
    return apiRequest<any>(`/credentials/api-keys/${id}/show/`, {
      method: 'POST',
    });
  },

  updateAPIKey: async (id: number, data: {
    name?: string;
    key_type?: 'server' | 'browser';
    bound_account?: string;
    restrictions?: string;
    restrictions_dict?: Record<string, any>;
  }) => {
    return apiRequest<any>(`/credentials/api-keys/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  deleteAPIKey: async (id: number) => {
    return apiRequest<{ message: string }>(`/credentials/api-keys/${id}/`, {
      method: 'DELETE',
    });
  },

  restoreAPIKey: async (id: number) => {
    return apiRequest<any>(`/credentials/api-keys/${id}/restore/`, {
      method: 'POST',
    });
  },

  getDeletedAPIKeys: async () => {
    const response = await apiRequest<any>('/credentials/api-keys/deleted/');
    // Handle paginated response or direct array
    return Array.isArray(response) ? response : (response.results || []);
  },

  // Bulk operations
  bulkDeleteCredentials: async (type: 'oauth_app' | 'api_key', ids: number[]) => {
    return apiRequest<{ message: string }>('/credentials/bulk-delete/', {
      method: 'POST',
      body: JSON.stringify({ type, ids }),
    });
  },

  // OAuth Consent Screen
  listConsentScreens: async () => {
    return apiRequest<any[]>('/credentials/consent-screens/');
  },

  getConsentScreen: async (oauthAppId: number) => {
    return apiRequest<any>(`/credentials/oauth-apps/${oauthAppId}/consent-screen/`);
  },

  createOrUpdateConsentScreen: async (oauthAppId: number, data: {
    app_name: string;
    app_description?: string;
    app_logo?: string;
    support_email: string;
    application_homepage?: string;
    privacy_policy_url?: string;
    terms_of_service_url?: string;
    authorized_domains?: string;
    authorized_domains_list?: string[];
    developer_contact_email: string;
    scope_descriptions?: Record<string, string>;
    scope_reasons?: Record<string, { description: string; reason: string }>;
    publishing_status?: 'draft' | 'testing' | 'published';
  }) => {
    return apiRequest<any>(`/credentials/oauth-apps/${oauthAppId}/consent-screen/`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateConsentScreen: async (oauthAppId: number, data: {
    app_name?: string;
    app_description?: string;
    app_logo?: string;
    support_email?: string;
    application_homepage?: string;
    privacy_policy_url?: string;
    terms_of_service_url?: string;
    authorized_domains?: string;
    authorized_domains_list?: string[];
    developer_contact_email?: string;
    scope_descriptions?: Record<string, string>;
    scope_reasons?: Record<string, { description: string; reason: string }>;
    publishing_status?: 'draft' | 'testing' | 'published';
  }) => {
    return apiRequest<any>(`/credentials/oauth-apps/${oauthAppId}/consent-screen/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Token refresh interceptor setup (for future enhancements)
export const setupTokenRefresh = () => {
  // Already implemented in apiRequest function above
};

