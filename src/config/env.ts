/**
 * Environment Configuration
 * 
 * Centralized configuration management for development and production environments.
 * All environment variables should be accessed through this module.
 */

type Environment = 'development' | 'production' | 'test';

interface AppConfig {
  // Environment
  env: Environment;
  isDevelopment: boolean;
  isProduction: boolean;
  isTest: boolean;

  // API Configuration
  apiBaseUrl: string;
  backendUrl: string;
  frontendUrl: string;
  apiTimeout: number;

  // OAuth Configuration
  googleClientId?: string;
  githubClientId?: string;

  // App Configuration
  appName: string;
  appVersion: string;
  
  // Feature Flags
  enableDebugLogs: boolean;
  enableAnalytics: boolean;
}

/**
 * Get the current environment
 */
const getEnvironment = (): Environment => {
  const env = import.meta.env.MODE || 'development';
  
  if (env === 'production') return 'production';
  if (env === 'test') return 'test';
  return 'development';
};

/**
 * Get environment variable with fallback
 */
const getEnvVar = (key: string, fallback: string = ''): string => {
  return import.meta.env[key] || fallback;
};

/**
 * Get boolean environment variable
 */
const getEnvBool = (key: string, fallback: boolean = false): boolean => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  return value === 'true' || value === '1';
};

/**
 * Get number environment variable
 */
const getEnvNumber = (key: string, fallback: number): number => {
  const value = import.meta.env[key];
  if (value === undefined) return fallback;
  const parsed = Number(value);
  return isNaN(parsed) ? fallback : parsed;
};

const env = getEnvironment();

// Helper to ensure API URL ends with /api/auth
const normalizeApiUrl = (url: string): string => {
  let normalized = url.replace(/\/+$/, ''); // Remove trailing slashes
  if (!normalized.endsWith('/api/auth')) {
    normalized = normalized.replace(/\/api\/?$/, '') + '/api/auth';
  }
  return normalized;
};

/**
 * Application Configuration
 * 
 * This object contains all configuration values for the application.
 * Values are loaded from environment variables with sensible defaults.
 */
export const config: AppConfig = {
  // Environment
  env,
  isDevelopment: env === 'development',
  isProduction: env === 'production',
  isTest: env === 'test',

  // API Configuration
  apiBaseUrl: normalizeApiUrl(
    getEnvVar('VITE_API_BASE_URL', 'http://localhost:8001/api/auth')
  ),
  backendUrl: getEnvVar('VITE_BACKEND_URL', 'http://localhost:8001'),
  frontendUrl: getEnvVar('VITE_FRONTEND_URL', typeof window !== 'undefined' ? window.location.origin : 'http://localhost:8081'),
  apiTimeout: getEnvNumber('VITE_API_TIMEOUT', 30000), // 30 seconds

  // OAuth Configuration (optional, can be configured in backend)
  googleClientId: getEnvVar('VITE_GOOGLE_CLIENT_ID', ''),
  githubClientId: getEnvVar('VITE_GITHUB_CLIENT_ID', ''),

  // App Configuration
  appName: getEnvVar('VITE_APP_NAME', 'SVA OAuth Client'),
  appVersion: getEnvVar('VITE_APP_VERSION', '1.0.0'),

  // Feature Flags
  enableDebugLogs: getEnvBool('VITE_ENABLE_DEBUG_LOGS', env === 'development'),
  enableAnalytics: getEnvBool('VITE_ENABLE_ANALYTICS', env === 'production'),
};

/**
 * Validate required configuration values
 */
export const validateConfig = (): void => {
  const errors: string[] = [];

  if (!config.apiBaseUrl) {
    errors.push('VITE_API_BASE_URL is required');
  }

  if (errors.length > 0) {
    throw new Error(`Configuration errors:\n${errors.join('\n')}`);
  }
};

/**
 * Log configuration (only in development)
 */
if (config.isDevelopment && config.enableDebugLogs) {
  console.log('🔧 Application Configuration:', {
    environment: config.env,
    apiBaseUrl: config.apiBaseUrl,
    backendUrl: config.backendUrl,
    frontendUrl: config.frontendUrl,
    apiTimeout: config.apiTimeout,
  });
}

// Validate configuration on import
validateConfig();

export default config;

