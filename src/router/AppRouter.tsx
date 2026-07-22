import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute, PublicOnlyRoute, AdminRoute, FamilyOwnerRoute } from './ProtectedRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { ListSkeleton } from '../components/ui/Skeleton';

const LandingPage        = lazy(() => import('../pages/LandingPage'));
const LoginPage          = lazy(() => import('../pages/LoginPage'));
const RegisterPage       = lazy(() => import('../pages/RegisterPage'));
const DoctorEntryPage    = lazy(() => import('../pages/DoctorEntryPage'));
const DoctorDashboardPage = lazy(() => import('../pages/DoctorDashboardPage'));
const DashboardPage  = lazy(() => import('../pages/DashboardPage'));
const HistorialPage  = lazy(() => import('../pages/HistorialPage'));
const MedicamentosPage = lazy(() => import('../pages/MedicamentosPage'));
const ExamenesPage   = lazy(() => import('../pages/ExamenesPage'));
const AlergiasPage   = lazy(() => import('../pages/AlergiasPage'));
const VacunasPage    = lazy(() => import('../pages/VacunasPage'));
const PerfilPage     = lazy(() => import('../pages/PerfilPage'));
const ElegirPlanPage = lazy(() => import('../pages/ElegirPlanPage'));
const FamiliaPage    = lazy(() => import('../pages/FamiliaPage'));
const FamiliaMemberPage = lazy(() => import('../pages/FamiliaMemberPage'));
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'));
const TermsPage      = lazy(() => import('../pages/legal/TermsPage'));
const PrivacyPage    = lazy(() => import('../pages/legal/PrivacyPage'));
const NotFoundPage   = lazy(() => import('../pages/NotFoundPage'));
const AceptarInvitacionPage = lazy(() => import('../pages/AceptarInvitacionPage'));

const Loader = () => (
  <div style={{ padding: 40 }}><ListSkeleton count={4} /></div>
);

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loader />}>
        <Routes>
          {/* Public-only routes */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/" element={<LandingPage />} />
          </Route>

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            {/* Selección de plan — pantalla completa, con sesión, fuera de AppLayout */}
            <Route path="/elegir-plan" element={<ElegirPlanPage />} />
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/historial" element={<HistorialPage />} />
              <Route path="/medicamentos" element={<MedicamentosPage />} />
              <Route path="/examenes" element={<ExamenesPage />} />
              <Route path="/alergias" element={<AlergiasPage />} />
              <Route path="/vacunas" element={<VacunasPage />} />
              <Route path="/perfil" element={<PerfilPage />} />
              <Route path="/familia" element={<FamiliaPage />} />
              {/* Historial de un miembro: solo owner (plan family) */}
              <Route element={<FamilyOwnerRoute />}>
                <Route path="/familia/:memberId" element={<FamiliaMemberPage />} />
              </Route>
            </Route>
          </Route>

          {/* Panel de administración — requiere login Y role === 'admin' */}
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminDashboardPage />} />
          </Route>

          {/* Páginas legales — públicas, accesibles con o sin sesión */}
          <Route path="/legal/terms" element={<TermsPage />} />
          <Route path="/legal/privacy" element={<PrivacyPage />} />

          {/* Rutas públicas para médicos — sin autenticación */}
          <Route path="/doctor" element={<DoctorEntryPage />} />
          <Route path="/doctor/:code" element={<DoctorDashboardPage />} />

          {/* Aceptación de invitación familiar — pública; coincide EXACTAMENTE
              con el link del correo (/family/accept/:id). La página decide el
              flujo según autenticación (registro/login con returnTo). */}
          <Route path="/family/accept/:invitationId" element={<AceptarInvitacionPage />} />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
