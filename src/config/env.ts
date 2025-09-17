export const config = {
  apiUrl: import.meta.env.VITE_API_URL || 'http://192.168.100.105:8000/api/v1/admin',
  appName: import.meta.env.VITE_APP_NAME || 'Student Welfare Fund Admin Portal',
} as const;
