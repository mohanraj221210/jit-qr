import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CircularProvider } from './context/CircularContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import DepartmentsPage from './pages/DepartmentsPage';
import ITDashboard from './pages/departments/ITDashboard';
import CSEDashboard from './pages/departments/CSEDashboard';
import ECEDashboard from './pages/departments/ECEDashboard';
import AIDSDashboard from './pages/departments/AIDSDashboard';
import MechanicalDashboard from './pages/departments/MechanicalDashboard';
import CSBSDashboard from './pages/departments/CSBSDashboard';
import MBADashboard from './pages/departments/MBADashboard';

/* Protected Route for Admin */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
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
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/departments" element={<DepartmentsPage />} />
      <Route path="/it" element={<ITDashboard />} />
      <Route path="/cse" element={<CSEDashboard />} />
      <Route path="/ece" element={<ECEDashboard />} />
      <Route path="/aids" element={<AIDSDashboard />} />
      <Route path="/mechanical" element={<MechanicalDashboard />} />
      <Route path="/csbs" element={<CSBSDashboard />} />
      <Route path="/mba" element={<MBADashboard />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

function App() {
  return (
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
  );
}

export default App;
