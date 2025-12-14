import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './services/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CreateReport } from './pages/CreateReport';
import { ReportList } from './pages/ReportList';
import { ReportDetail } from './pages/ReportDetail';
import { UserManagement } from './pages/UserManagement';
import { NotificationGuard } from './components/NotificationGuard';

const ProtectedRoute: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null; // ya spinner

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (roles && user && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <Layout>{children}</Layout>;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<Login />} />

    <Route path="/" element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    } />

    <Route path="/create" element={
      <ProtectedRoute roles={['user']}>
        <CreateReport />
      </ProtectedRoute>
    } />

    <Route path="/reports" element={
      <ProtectedRoute>
        <ReportList />
      </ProtectedRoute>
    } />

    <Route path="/reports/:id" element={
      <ProtectedRoute>
        <ReportDetail />
      </ProtectedRoute>
    } />

    <Route path="/users" element={
      <ProtectedRoute roles={['developer']}>
        <UserManagement />
      </ProtectedRoute>
    } />

    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

const App: React.FC = () => (
  <AuthProvider>
    <HashRouter>
      {/* Notification Guard Wrap */}
      <NotificationGuard>
        <AppRoutes />
      </NotificationGuard>
    </HashRouter>
  </AuthProvider>
);

export default App;
