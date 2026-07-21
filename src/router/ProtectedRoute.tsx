import React, { useEffect } from 'react';
import { Navigate, Outlet, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';
import { toast } from '../store/toast.store';
import { safeReturnTo } from '../utils/returnTo';

export function ProtectedRoute() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  if (!isAuth) return <Navigate to="/login" replace />;
  return <Outlet />;
}

export function PublicOnlyRoute() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const [params] = useSearchParams();
  if (isAuth) {
    // Un usuario ya autenticado que llega a /login o /register con un returnTo
    // interno válido (p. ej. desde el correo de invitación) va a ese destino;
    // si no, mantiene el comportamiento actual (/dashboard).
    const dest = safeReturnTo(params.get('returnTo')) ?? '/dashboard';
    return <Navigate to={dest} replace />;
  }
  return <Outlet />;
}

/**
 * Requiere sesión iniciada Y `plan === 'family'` (owner). Un usuario logueado
 * sin ese plan que fuerce `/familia/:memberId` es redirigido a `/familia`
 * (defensa en profundidad: el backend `FamilyAccessGuard` ya respondería 403).
 */
export function FamilyOwnerRoute() {
  const isAuth = useAuthStore((s) => s.isAuthenticated());
  const plan = useAuthStore((s) => s.user?.plan);
  if (!isAuth) return <Navigate to="/login" replace />;
  if (plan !== 'family') return <Navigate to="/familia" replace />;
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
