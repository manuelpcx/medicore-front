import React, { useEffect, useState } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts';
import { AdminLayout } from './AdminLayout';
import { UserDetailModal } from './UserDetailModal';
import { Card } from '../../components/ui/Card';
import { Skeleton } from '../../components/ui/Skeleton';
import { useAdminStats, useAdminUsers } from '../../hooks/useAdmin';
import { fDateShort, fRelative } from '../../utils/format';

const PAGE_SIZE = 15;

export default function AdminDashboardPage() {
  const { data: stats, isLoading: loadingStats, isError: statsError } = useAdminStats();

  // Tabla: búsqueda (con debounce) + paginación
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    const t = setTimeout(() => { setDebounced(search); setPage(1); }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const { data: usersPage, isLoading: loadingUsers, isFetching: fetchingUsers, isError: usersError } =
    useAdminUsers({ page, limit: PAGE_SIZE, search: debounced || undefined });

  const users = usersPage?.users ?? [];
  const total = usersPage?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const chartData = (stats?.signups_by_day ?? []).map((d) => ({
    ...d,
    label: fDateShort(d.date).slice(0, 5), // dd/MM
  }));

  return (
    <AdminLayout>
      {/* ── Sección 1 — Métricas de usuarios ─────────────────────────── */}
      <SectionTitle>Usuarios</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 28 }}>
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <Card key={i}><Skeleton height={48} /></Card>)
        ) : statsError ? (
          <Card style={{ gridColumn: '1 / -1' }}>
            <p style={{ color: 'var(--red)', fontSize: 14 }}>No se pudieron cargar las métricas.</p>
          </Card>
        ) : (
          <>
            <MetricCard label="Total usuarios" value={stats?.total_users} icon="👥" />
            <MetricCard label="Nuevos esta semana" value={stats?.users_this_week} icon="📈" />
            <MetricCard label="Nuevos este mes" value={stats?.users_this_month} icon="🗓️" />
            <MetricCard label="Activos últimos 7 días" value={stats?.active_users_last_7_days} icon="⚡" />
          </>
        )}
      </div>

      {/* ── Sección 2 — Gráfico de registros ─────────────────────────── */}
      <SectionTitle>Registros por día (últimos 30 días)</SectionTitle>
      <Card style={{ marginBottom: 28, padding: '20px 16px 12px' }}>
        {loadingStats ? (
          <Skeleton height={260} />
        ) : chartData.length === 0 ? (
          <p style={{ color: 'var(--text3)', fontSize: 14, padding: 20, textAlign: 'center' }}>
            Sin datos de registros.
          </p>
        ) : (
          <div style={{ width: '100%', height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--text3)' }}
                  interval="preserveStartEnd" tickLine={false} axisLine={{ stroke: 'var(--border)' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: 'var(--text3)' }}
                  tickLine={false} axisLine={false} width={40} />
                <Tooltip
                  cursor={{ fill: 'var(--purple2)' }}
                  contentStyle={{
                    background: 'var(--surface)', border: '1px solid var(--border)',
                    borderRadius: 8, fontSize: 13, boxShadow: 'var(--shadow)',
                  }}
                  labelStyle={{ color: 'var(--text2)' }}
                  formatter={(value) => [`${value}`, 'Registros'] as [string, string]}
                />
                <Bar dataKey="count" fill="var(--purple)" radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* ── Sección 3 — Tabla de usuarios ────────────────────────────── */}
      <SectionTitle>Usuarios registrados</SectionTitle>
      <Card style={{ marginBottom: 28, padding: 0, overflow: 'hidden' }}>
        {/* Buscador */}
        <div style={{ padding: 16, borderBottom: '1px solid var(--border)' }}>
          <input
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', maxWidth: 340, padding: '9px 12px', borderRadius: 8,
              border: '1.5px solid var(--border)', background: 'var(--surface)',
              fontSize: 14, outline: 'none',
            }}
          />
        </div>

        {/* Tabla */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14, minWidth: 720 }}>
            <thead>
              <tr style={{ background: 'var(--surface2)' }}>
                <Th>Nombre</Th>
                <Th>Email</Th>
                <Th>Registro</Th>
                <Th>Último login</Th>
                <Th align="right"># Consultas</Th>
                <Th align="right"># Exámenes</Th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                Array.from({ length: 6 }).map((_, i) => (
                  <tr key={i} style={{ borderTop: '1px solid var(--border)' }}>
                    <td colSpan={6} style={{ padding: '12px 16px' }}><Skeleton height={18} /></td>
                  </tr>
                ))
              ) : usersError ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text2)' }}>
                    <div style={{ fontSize: 26, marginBottom: 8 }}>🚧</div>
                    El listado de usuarios aún no está disponible.
                    <div style={{ fontSize: 12, color: 'var(--text3)', marginTop: 4 }}>
                      Falta implementar el endpoint <code>GET /admin/users</code> en el backend.
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: 'var(--text3)' }}>
                    No se encontraron usuarios.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setSelectedUserId(u.id)}
                    style={{ borderTop: '1px solid var(--border)', cursor: 'pointer', transition: 'background 0.12s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--surface2)')}
                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  >
                    <Td><span style={{ fontWeight: 500 }}>{u.nombre}</span></Td>
                    <Td><span style={{ color: 'var(--text2)' }}>{u.email}</span></Td>
                    <Td>{fDateShort(u.created_at)}</Td>
                    <Td>{u.last_login_at ? fRelative(u.last_login_at) : <span style={{ color: 'var(--text3)' }}>Nunca</span>}</Td>
                    <Td align="right">{u.history_count}</Td>
                    <Td align="right">{u.exam_count}</Td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
          padding: '12px 16px', borderTop: '1px solid var(--border)', flexWrap: 'wrap',
        }}>
          <span style={{ fontSize: 13, color: 'var(--text3)' }}>
            {total > 0 ? `${total} usuario${total !== 1 ? 's' : ''}` : ''}
            {fetchingUsers && ' · actualizando…'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <PageButton disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>← Anterior</PageButton>
            <span style={{ fontSize: 13, color: 'var(--text2)' }}>Página {page} de {totalPages}</span>
            <PageButton disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Siguiente →</PageButton>
          </div>
        </div>
      </Card>

      {/* ── Sección 4 — Métricas generales de uso ────────────────────── */}
      <SectionTitle>Uso general de la plataforma</SectionTitle>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        {loadingStats ? (
          Array.from({ length: 4 }).map((_, i) => <Card key={i}><Skeleton height={48} /></Card>)
        ) : (
          <>
            <MetricCard label="Historiales clínicos" value={stats?.total_medical_history} icon="📋" />
            <MetricCard label="Medicamentos registrados" value={stats?.total_medications} icon="💊" />
            <MetricCard label="Exámenes subidos" value={stats?.total_exams} icon="🔬" />
            <MetricCard label="Códigos QR generados" value={stats?.total_access_codes_generated} icon="🔗" />
          </>
        )}
      </div>

      <UserDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
    </AdminLayout>
  );
}

// ── Helpers de presentación ──────────────────────────────────────────────
function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="serif" style={{ fontSize: 18, fontWeight: 400, marginBottom: 14 }}>{children}</h2>
  );
}

function MetricCard({ label, value, icon }: { label: string; value?: number; icon: string }) {
  return (
    <Card style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text3)' }}>
          {label}
        </span>
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <span style={{ fontSize: 30, fontWeight: 700, color: 'var(--purple)' }}>{value ?? 0}</span>
    </Card>
  );
}

function Th({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <th style={{
      textAlign: align, padding: '10px 16px', fontSize: 12, fontWeight: 600,
      color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: 0.3, whiteSpace: 'nowrap',
    }}>
      {children}
    </th>
  );
}

function Td({ children, align = 'left' }: { children: React.ReactNode; align?: 'left' | 'right' }) {
  return (
    <td style={{ padding: '12px 16px', textAlign: align, whiteSpace: 'nowrap' }}>{children}</td>
  );
}

function PageButton({ children, disabled, onClick }: { children: React.ReactNode; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '7px 12px', fontSize: 13, borderRadius: 'var(--radius-btn)',
        border: '1px solid var(--border)', background: 'var(--surface)',
        color: disabled ? 'var(--text3)' : 'var(--text)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1, fontFamily: 'inherit',
      }}
    >
      {children}
    </button>
  );
}
