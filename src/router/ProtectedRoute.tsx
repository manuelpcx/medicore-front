import React, { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { toast } from '../store/toast.store';

export function ProtectedRoute() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  if (isAuth) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

/** Requiere sesión iniciada Y role === 'admin'. */
export function AdminRoute() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const role = useAuthStore((s) => s.user?.role);
  const denied = isAuth && role !== 'admin';

  useEffect(() => {
    if (denied) toast.error('No tienes acceso a esta sección');
  }, [denied]);

  if (!isAuth) return <Navigate to="/login" replace />;
  if (role !== 'admin') return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}
