import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Layout from './Layout';

// roles: optional array e.g. ['hr', 'admin']. If omitted, any authenticated user may access.
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={user.role === 'employee' ? '/' : '/hr'} replace />;
  }

  return <Layout>{children}</Layout>;
};

export default ProtectedRoute;
