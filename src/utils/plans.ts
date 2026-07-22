import type { Plan } from '../types';

// ── Catálogo estático de planes (no hay endpoint GET /plans) ────────────────
// Fuente única de verdad: consumida por ElegirPlanPage.tsx (selección real de
// plan) y por LandingPage.tsx (vitrina pública de planes). Cambiar un precio o
// una feature aquí actualiza ambas páginas sin desincronización.
export interface PlanCard {
  id: Plan;
  nombre: string;
  precio: string;
  color: string;
  features: string[];
}

export const PLANS: readonly PlanCard[] = [
  {
    id: 'free',
    nombre: 'Free',
    precio: '$0',
    color: 'var(--accent)',
    features: ['Historial personal', 'Hasta 4 exámenes con archivo', 'Alergias y vacunas'],
  },
  {
    id: 'pro',
    nombre: 'Pro',
    precio: '$4.990/mes',
    color: 'var(--accent)',
    features: ['Todo lo de Free', 'Exámenes con archivo ilimitados'],
  },
  {
    id: 'family',
    nombre: 'Family',
    precio: '$8.990/mes',
    color: 'var(--purple)',
    features: [
      'Todo lo de Pro',
      'Hasta 5 personas en tu grupo: familiares + menores',
      'Agregar menores a tu cargo (exclusivo Family)',
    ],
  },
] as const;
