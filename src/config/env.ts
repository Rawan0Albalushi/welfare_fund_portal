export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  appName: import.meta.env.VITE_APP_NAME || 'Student Welfare Fund Admin Portal',
} as const;
