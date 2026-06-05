import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin, App as AntdApp } from 'antd';

import { AuthProvider } from '../context/auth/AuthContext';
import { useAuth } from '../hooks/useAuth';

import PublicLayout from '../layouts/PublicLayout/PublicLayout';
import PrivateLayout from '../layouts/PrivateLayout/PrivateLayout';

import Login from '../pages/Auth/Login';

import Dashboard from '../pages/Dashboard/Dashboard';
import DashboardMedico from '../pages/DashboardMedico/DashboardMedico';
import DashboardConsultor from '../pages/DashboardConsultor/DashboardConsultor';

import Clinicas from '../pages/clinicas/Clinicas';
import Usuarios from '../pages/Usuarios/Usuarios';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <Spin size="large" />
      </div>
    );
  }

  return isAuthenticated ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
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

            <Route
              element={
                <ProtectedRoute>
                  <PrivateLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />

              <Route path="/dashboard-medico" element={<DashboardMedico />} />

              <Route path="/dashboard-consultor" element={<DashboardConsultor />} />

              <Route path="/usuarios" element={<Usuarios />} />

              <Route path="/clinicas" element={<Clinicas />} />

              <Route path="/clinicas/nueva" element={<Clinicas />} />

              <Route path="/clinicas/:id" element={<Clinicas />} />

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Route>
          </Routes>
        </AntdApp>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRouter;