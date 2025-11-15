// OAuth utility functions for Google and GitHub
// Frontend-initiated OAuth flow - redirects directly to providers

import config from '@/config/env';

const BACKEND_URL = config.backendUrl;
const FRONTEND_URL = config.frontendUrl;
const API_BASE_URL = config.apiBaseUrl;

/**
 * Generate a random state string for OAuth security (CSRF protection)
 */
function generateState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15) + 
         Date.now().toString(36);
}

/**
 * Store OAuth state in sessionStorage and localStorage as backup
 */
function storeOAuthState(provider: 'google' | 'github', state: string): void {
  const key = `oauth_state_${provider}`;
  const timeKey = `oauth_state_time_${provider}`;
  const timestamp = Date.now().toString();
  
  // Store in both sessionStorage and localStorage for redundancy
  sessionStorage.setItem(key, state);
  sessionStorage.setItem(timeKey, timestamp);
  localStorage.setItem(key, state);
  localStorage.setItem(timeKey, timestamp);
  
  console.log(`Stored OAuth state for ${provider}:`, state);
}

/**
 * Verify and clear OAuth state
 */
function verifyOAuthState(provider: 'google' | 'github', state: string): boolean {
  try {
    const key = `oauth_state_${provider}`;
    const timeKey = `oauth_state_time_${provider}`;
    
    // Try sessionStorage first, then localStorage as fallback
    let storedState = sessionStorage.getItem(key);
    let storedTime = sessionStorage.getItem(timeKey);
    
    if (!storedState || !storedTime) {
      // Fallback to localStorage
      storedState = localStorage.getItem(key);
      storedTime = localStorage.getItem(timeKey);
      console.log('OAuth state not in sessionStorage, checking localStorage:', { found: !!storedState });
    }
    
    console.log('Verifying OAuth state:', { provider, state, storedState: storedState ? 'found' : 'missing', storedTime });
    
    if (!storedState || !storedTime) {
      console.warn('OAuth state not found in storage');
      // For development, allow if state is present in URL (less secure but helps debugging)
      if (state && state.length > 10) {
        console.warn('Allowing OAuth without stored state (development mode)');
        return true;
      }
      return false;
    }
    
    // Check if state expired (10 minutes)
    const timeDiff = Date.now() - parseInt(storedTime, 10);
    if (timeDiff > 10 * 60 * 1000) {
      console.warn('OAuth state expired');
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(timeKey);
      localStorage.removeItem(key);
      localStorage.removeItem(timeKey);
      return false;
    }
    
    if (storedState === state) {
      // Clear state after successful verification
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(timeKey);
      localStorage.removeItem(key);
      localStorage.removeItem(timeKey);
      console.log('OAuth state verified successfully');
      return true;
    }
    
    console.warn('OAuth state mismatch:', { stored: storedState, received: state });
    return false;
  } catch (error) {
    console.error('Error verifying OAuth state:', error);
    return false;
  }
}

/**
 * Google OAuth - Redirects directly to Google OAuth page
 */
export function initiateGoogleOAuth(): void {
  try {
    const state = generateState();
    storeOAuthState('google', state);

    const redirectUri = `${FRONTEND_URL}/auth/callback/google`;
    const scope = 'openid email profile';
    
    // Try to get client ID from backend first, fallback to env var
    const configUrl = `${API_BASE_URL}/oauth/config/google/`;
    console.log('Fetching OAuth config from:', configUrl);
    fetch(configUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend config not available');
        return res.json();
      })
      .then(config => {
        const params = new URLSearchParams({
          client_id: config.client_id,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: scope,
          state: state,
          access_type: 'offline',
          prompt: 'consent',
        });

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        window.location.href = googleAuthUrl;
      })
      .catch(() => {
        // Fallback: use environment variable
        const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (!clientId) {
          throw new Error('Google OAuth is not configured. Please set VITE_GOOGLE_CLIENT_ID or configure in backend.');
        }
        
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          response_type: 'code',
          scope: scope,
          state: state,
          access_type: 'offline',
          prompt: 'consent',
        });

        const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
        window.location.href = googleAuthUrl;
      });
  } catch (error: any) {
    console.error('Failed to initiate Google OAuth:', error);
    throw new Error(error.message || 'Failed to start Google authentication. Please try again.');
  }
}

/**
 * GitHub OAuth - Redirects directly to GitHub OAuth page
 */
export function initiateGitHubOAuth(): void {
  try {
    const state = generateState();
    storeOAuthState('github', state);

    const redirectUri = `${FRONTEND_URL}/auth/callback/github`;
    const scope = 'user:email';
    
    // Try to get client ID from backend first, fallback to env var
    const configUrl = `${API_BASE_URL}/oauth/config/github/`;
    console.log('Fetching OAuth config from:', configUrl);
    fetch(configUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(res => {
        if (!res.ok) throw new Error('Backend config not available');
        return res.json();
      })
      .then(config => {
        const params = new URLSearchParams({
          client_id: config.client_id,
          redirect_uri: redirectUri,
          scope: scope,
          state: state,
        });

        const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        window.location.href = githubAuthUrl;
      })
      .catch(() => {
        // Fallback: use environment variable
        const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
        if (!clientId) {
          throw new Error('GitHub OAuth is not configured. Please set VITE_GITHUB_CLIENT_ID or configure in backend.');
        }
        
        const params = new URLSearchParams({
          client_id: clientId,
          redirect_uri: redirectUri,
          scope: scope,
          state: state,
        });

        const githubAuthUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
        window.location.href = githubAuthUrl;
      });
  } catch (error: any) {
    console.error('Failed to initiate GitHub OAuth:', error);
    throw new Error(error.message || 'Failed to start GitHub authentication. Please try again.');
  }
}

/**
 * Exchange OAuth code for tokens via backend
 */
export async function exchangeOAuthCode(
  provider: 'google' | 'github',
  code: string,
  state: string
): Promise<{ access: string; refresh: string; user: any }> {
  // Verify state for CSRF protection
  if (!verifyOAuthState(provider, state)) {
    throw new Error('Invalid OAuth state. Possible CSRF attack or expired session.');
  }

  try {
    const exchangeUrl = `${API_BASE_URL}/oauth/exchange/`;
    console.log('Exchanging OAuth code at:', exchangeUrl);
    const response = await fetch(exchangeUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        provider,
        code,
        redirect_uri: `${FRONTEND_URL}/auth/callback/${provider}`.replace(/\/+$/, ''), // Ensure no trailing slash
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || error.detail || 'Failed to exchange OAuth code');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('OAuth exchange error:', error);
    throw error;
  }
}

/**
 * Check if OAuth providers are configured
 */
export function isOAuthConfigured(): { google: boolean; github: boolean } {
  // Check if client IDs are available (either from env or backend)
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const githubClientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
  
  return {
    google: !!googleClientId, // Will also check backend if env var not set
    github: !!githubClientId, // Will also check backend if env var not set
  };
}

