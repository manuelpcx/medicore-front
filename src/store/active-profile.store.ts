import { create } from 'zustand';

/**
 * Perfil activo del espacio del menor. Es estado de CLIENTE (Zustand), no de
 * servidor: los datos de dominio siguen viviendo en React Query, y este store
 * solo guarda a QUÉ perfil apuntan las consultas (el `patientId` activo).
 *
 * - Adulto (por defecto): `{ patientId: null, isMinor: false, nombre: null }`.
 *   `patientId = null` ⇒ las apis de dominio NO anexan `?patientId` ⇒
 *   comportamiento actual del adulto (sin regresión).
 * - Menor: `{ patientId: <id>, isMinor: true, nombre: <nombre> }`.
 *
 * NO usa `persist()` (como `doctor.store.ts`): al recargar vuelve al adulto,
 * evitando quedar apuntando a un `patientId` de un menor que pudo eliminarse.
 */
export interface ActiveProfile {
  patientId: string | null;
  isMinor: boolean;
  nombre: string | null;
}

interface ActiveProfileState extends ActiveProfile {
  /** Selecciona un perfil (adulto o menor). */
  setProfile: (p: ActiveProfile) => void;
  /** Restablece el perfil activo al adulto. */
  resetToAdult: () => void;
}

const ADULT: ActiveProfile = { patientId: null, isMinor: false, nombre: null };

export const useActiveProfile = create<ActiveProfileState>((set) => ({
  ...ADULT,
  setProfile: (p) => set({ ...p }),
  resetToAdult: () => set({ ...ADULT }),
}));
