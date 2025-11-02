import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { AppThemeProvider } from './contexts/ThemeContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Categories } from './pages/Categories';
import { Programs } from './pages/Programs';
import { Settings } from './pages/Settings';
import { Donations } from './pages/Donations';
import { Applications } from './pages/Applications';
import { Campaigns } from './pages/Campaigns';
import { Users } from './pages/Users';
// import { RolesPermissions } from './pages/RolesPermissions';
// import { AuditLogs } from './pages/AuditLogs';
import { FinancialReport } from './pages/FinancialReport';
import './i18n';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    },
  },
});

// Add query client event listeners for debugging
queryClient.getQueryCache().subscribe((event) => {
  if (event.query.queryKey[0] === 'auth') {
    console.log('🔍 [React Query] Auth query event:', {
      type: event.type,
      queryKey: event.query.queryKey,
      timestamp: new Date().toISOString(),
      state: event.query.state.status
    });
  }
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppThemeProvider>
          <LanguageProvider>
            <Router>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                
                {/* Protected Routes */}
                <Route
                  path="/*"
                  element={
                    <ProtectedRoute>
                      <ErrorBoundary>
                        <AppLayout>
                          <Routes>
                            <Route path="/" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/dashboard" element={<Dashboard />} />
                            <Route path="/categories" element={<Categories />} />
                            <Route path="/programs" element={<Programs />} />
                            <Route path="/campaigns" element={<Campaigns />} />
                            <Route path="/applications" element={<Applications />} />
                            <Route path="/donations" element={<Donations />} />
                            <Route path="/financial-report" element={<FinancialReport />} />
                            <Route path="/users" element={<Users />} />
                            {/* <Route path="/roles-permissions" element={<RolesPermissions />} /> */}
                            {/* <Route path="/audit-logs" element={<AuditLogs />} /> */}
                            <Route path="/settings" element={<Settings />} />
                            <Route path="*" element={<Navigate to="/dashboard" replace />} />
                          </Routes>
                        </AppLayout>
                      </ErrorBoundary>
                    </ProtectedRoute>
                  }
                />
              </Routes>
            </Router>
          </LanguageProvider>
        </AppThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;