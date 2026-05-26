import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/auth/AuthContext';
import { useAuth } from '../hooks/useAuth';
import { Spin, App as AntdApp } from 'antd';
import PublicLayout from '../layouts/PublicLayout/PublicLayout';
import PrivateLayout from '../layouts/PrivateLayout/PrivateLayout';
import Login from '../pages/Auth/Login';
import Dashboard from '../pages/Dashboard/Dashboard';
import Clinicas from '../pages/clinicas/Clinicas';
import Usuarios from '../pages/Usuarios/Usuarios';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" description="Cargando..." />
      </div>
    );
  }
  
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AntdApp>
          <Routes>
            <Route element={<PublicLayout />}>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<Navigate to="/login" replace />} />
            </Route>
            
            <Route element={<PrivateLayout />}>
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/usuarios" element={<Usuarios />} />
              <Route path="/clinicas" element={<ProtectedRoute><Clinicas /></ProtectedRoute>} />
              <Route path="/clinicas/nueva" element={<ProtectedRoute><Clinicas /></ProtectedRoute>} />
              <Route path="/clinicas/:id" element={<ProtectedRoute><Clinicas /></ProtectedRoute>} />
            </Route>
          </Routes>
        </AntdApp>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;