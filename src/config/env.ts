/**
 * Environment configuration with validation
 * Throws error if required environment variables are missing in production
 */

const isDev = import.meta.env.DEV;
const isProd = import.meta.env.PROD;

// Simple logger for env validation (before main logger is available)
const envLogger = {
  warn: (message: string) => {
    if (isDev) {
      console.warn(`⚠️ [ENV] ${message}`);
    }
  }
};

function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = import.meta.env[key];
  
  if (value) {
    return value;
  }
  
  if (defaultValue) {
    envLogger.warn(`${key} not set, using default: ${defaultValue}`);
    return defaultValue;
  }
  
  if (isProd) {
    throw new Error(`❌ Required environment variable ${key} is missing`);
  }
  
  // In development, use a sensible default
  const devDefaults: Record<string, string> = {
    VITE_API_URL: 'http://localhost:8000/api/v1/admin',
    VITE_APP_NAME: 'Student Welfare Fund Admin Portal',
  };
  
  const devValue = devDefaults[key];
  if (devValue) {
    envLogger.warn(`${key} not set, using dev default: ${devValue}`);
    return devValue;
  }
  
  throw new Error(`❌ Environment variable ${key} is required`);
}

export const config = {
  apiUrl: getRequiredEnv('VITE_API_URL', 'http://localhost:8000/api/v1/admin'),
  appName: getRequiredEnv('VITE_APP_NAME', 'Student Welfare Fund Admin Portal'),
  isDev,
  isProd,
} as const;

// Validate API URL format in production
if (isProd && config.apiUrl) {
  try {
    new URL(config.apiUrl);
  } catch {
    throw new Error(`❌ Invalid VITE_API_URL format: ${config.apiUrl}`);
  }
}
