import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircularProvider } from './context/CircularContext';
import { getAdminAuth, clearAdminAuth } from './utils/storage';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import ITDashboard from './pages/departments/ITDashboard';
import CSEDashboard from './pages/departments/CSEDashboard';
import ECEDashboard from './pages/departments/ECEDashboard';
import AIDSDashboard from './pages/departments/AIDSDashboard';
import MechanicalDashboard from './pages/departments/MechanicalDashboard';
import CSBSDashboard from './pages/departments/CSBSDashboard';
import MBADashboard from './pages/departments/MBADashboard';
import HomePage from './pages/HomePage';
import NoticeDetail from './pages/NoticeDetail';

/* Protected Route for Admin */
const ProtectedAdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = getAdminAuth();
  if (!token || token.trim() === '') {
    clearAdminAuth();
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function AppRoutes() {
  const { isAuthenticated } = useAuth();
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/admin" replace /> : <LoginPage />}
      />
      <Route
        path="/admin"
        element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        }
      />
      <Route path="/" element={<HomePage />} />
      <Route path="/notice/:slugId" element={<NoticeDetail />} />
      <Route path="/it" element={<ITDashboard />} />
      <Route path="/cse" element={<CSEDashboard />} />
      <Route path="/ece" element={<ECEDashboard />} />
      <Route path="/aids" element={<AIDSDashboard />} />
      <Route path="/mechanical" element={<MechanicalDashboard />} />
      <Route path="/csbs" element={<CSBSDashboard />} />
      <Route path="/mba" element={<MBADashboard />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <CircularProvider>
            <AppRoutes />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  borderRadius: '12px',
                  background: '#1e293b',
                  color: '#f8fafc',
                  fontFamily: 'Inter, sans-serif',
                },
              }}
            />
          </CircularProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  );
}

export default App;
