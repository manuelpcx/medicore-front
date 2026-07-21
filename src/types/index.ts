export interface ApiResponse<T> {
  data: T;
  message: string;
  statusCode: number;
}

export type UserRole = 'patient' | 'admin';

/** Plan de suscripción del usuario. Viene de `res.user` de /auth/login. */
export type Plan = 'free' | 'pro' | 'family';

export interface User {
  id: string;
  email: string;
  nombre: string;
  fecha_nacimiento?: string;
  tipo_sangre?: string;
  activo: boolean;
  created_at: string;
  /** Rol del usuario. Viene del JWT decodificado o de la respuesta de /auth/login. */
  role?: UserRole;
  /** Plan de suscripción. `'family'` habilita el modo owner del plan familiar. */
  plan?: Plan;
  /** Grupo familiar al que pertenece como miembro aceptado (null si ninguno). */
  family_group_id?: string | null;
}

// ── Plan Familiar ───────────────────────────────────────────────────────────
export type FamilyStatus = 'pending' | 'accepted' | 'rejected';
export type Relationship = 'padre' | 'madre' | 'hijo/a' | 'cónyuge' | 'otro';

/** Fila devuelta por GET /family/members (family.service.ts:123-129). */
export interface FamilyMemberRow {
  id: string;
  nombre: string;
  relationship: string;
  status: FamilyStatus;
  accepted_at: string | null;
}

/** Info del grupo devuelta por GET /family/group (family.service.ts:200-209). */
export interface FamilyGroupInfo {
  id: string;
  owner: { id: string; nombre: string | null };
  max_members: number;
  members: number;
  minors: number;
  occupied: number;
  available: number;
}

/** Fila FamilyMember cruda devuelta por GET /family/invitations, /accept, /reject. */
export interface Invitation {
  id: string;
  family_group_id: string;
  user_id: string | null;
  email: string;
  relationship: string;
  status: FamilyStatus;
  invited_by: string;
  invited_at: string;
  accepted_at: string | null;
}

// ── Espacio del menor (feature 19/20) ───────────────────────────────────────
export type SexoMenor = 'masculino' | 'femenino' | 'otro';

/** Menor devuelto por GET /family/minors (feature 19). */
export interface Minor {
  id: string;
  nombre: string;
  birth_date: string;
  edad: number;
  sexo: SexoMenor;
  relacion?: string | null;
  is_minor: boolean;
}

/** Payload de POST /family/minors. `consentimiento` debe ser true. */
export interface CreateMinorDto {
  nombre: string;
  birth_date: string;
  sexo: SexoMenor;
  relacion?: string;
  consentimiento: boolean;
}

export interface VitalSigns {
  peso?: number;
  altura?: number;
  presion_arterial?: string;
  frecuencia_cardiaca?: number;
  temperatura?: number;
}

export interface Patient extends VitalSigns {
  id: string;
  user_id: string;
  telefono?: string;
  direccion?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
  updated_at: string;
}

export interface PatientProfile extends User {
  perfil: Patient;
}

export type TipoConsulta = 'control' | 'urgencia' | 'especialidad' | 'preventivo';

export interface MedicalHistory {
  id: string;
  patient_id: string;
  fecha: string;
  especialidad: string;
  doctor: string;
  institucion?: string;
  diagnostico?: string;
  notas?: string;
  tipo: TipoConsulta;
  proxima_cita?: string | null;
  tipo_proxima_cita?: string | null;
  recordatorio_activo?: boolean;
  created_at: string;
  updated_at: string;
}

export type EstadoMedicamento = 'activo' | 'finalizado';

export interface Medication {
  id: string;
  patient_id: string;
  nombre: string;
  dosis: string;
  frecuencia: string;
  horario?: string;
  estado: EstadoMedicamento;
  /** Tratamiento sin fecha de término definida. Independiente de `estado`. */
  permanente: boolean;
  medico_recetante?: string;
  fecha_inicio?: string;
  fecha_fin?: string | null;
  horario_notificacion?: string | null;
  notificacion_activa: boolean;
  created_at: string;
  updated_at: string;
}

export type ResultadoBadge = 'normal' | 'alterado' | 'pendiente';

export interface Exam {
  id: string;
  patient_id: string;
  nombre: string;
  fecha: string;
  laboratorio?: string;
  tipo?: string;
  resultado_badge: ResultadoBadge;
  archivo_path?: string;
  archivo_nombre?: string;
  archivo_mimetype?: string;
  created_at: string;
}

export type SeveridadAlergia = 'leve' | 'moderada' | 'severa';
export type TipoAlergia = 'medicamento' | 'alimentaria' | 'ambiental' | 'otra';

export interface Allergy {
  id: string;
  patient_id: string;
  nombre: string;
  severidad: SeveridadAlergia;
  tipo: TipoAlergia;
  created_at: string;
}

export interface Vaccine {
  id: string;
  patient_id: string;
  nombre: string;
  fecha: string;
  lote?: string;
  institucion?: string;
  proxima_dosis?: string;
  created_at: string;
}

export interface AccessCode {
  id: string;
  code: string;
  expires_at: string;
  message: string;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface LoginResponse extends AuthTokens {
  user: User;
  message: string;
}

/** Respuesta de PATCH /auth/plan (desenvuelta del ApiResponse). */
export interface SetPlanResponse {
  user: User;
  message: string;
}

// ── Pagos / suscripción Flow (feature 32) ───────────────────────────────────
export type SubscriptionStatusValue = 'pending' | 'active' | 'past_due' | null;

/** Respuesta de GET /payments/subscription (desenvuelta del ApiResponse). */
export interface SubscriptionState {
  plan: Plan;
  status: SubscriptionStatusValue;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

/** Respuesta de POST /payments/checkout. */
export interface CheckoutResponse {
  checkout_url: string;
}

/** Respuesta de POST /payments/subscription/cancel. */
export interface CancelSubscriptionResponse {
  message: string;
  current_period_end: string | null;
}

// Form DTOs
export interface RegisterDto {
  nombre: string;
  email: string;
  password: string;
  fecha_nacimiento?: string;
  tipo_sangre?: string;
  /** Consentimiento explícito — debe ser true. Requerido por Ley 19.628 / Ley 21.719. */
  consent_accepted: boolean;
  /** Token de la casilla reCAPTCHA v2 — exigido por POST /auth/register. */
  recaptcha_token: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateHistoryDto {
  fecha: string;
  especialidad: string;
  doctor: string;
  institucion?: string;
  diagnostico?: string;
  notas?: string;
  tipo?: TipoConsulta;
  proxima_cita?: string | null;
  tipo_proxima_cita?: string | null;
  recordatorio_activo?: boolean;
}

export interface CreateMedicationDto {
  nombre: string;
  dosis: string;
  frecuencia: string;
  horario?: string;
  estado?: EstadoMedicamento;
  permanente?: boolean;
  medico_recetante?: string;
  fecha_inicio?: string;
  fecha_fin?: string | null;
  horario_notificacion?: string | null;
  notificacion_activa?: boolean;
}

export interface CreateAllergyDto {
  nombre: string;
  severidad: SeveridadAlergia;
  tipo?: TipoAlergia;
}

export interface CreateVaccineDto {
  nombre: string;
  fecha: string;
  lote?: string;
  institucion?: string;
  proxima_dosis?: string;
}

export interface CreateExamDto {
  nombre: string;
  fecha: string;
  laboratorio?: string;
  tipo?: string;
  resultado_badge?: ResultadoBadge;
}

export interface UpdatePatientDto extends Partial<VitalSigns> {
  telefono?: string;
  direccion?: string;
  contacto_emergencia?: string;
  telefono_emergencia?: string;
}

export interface NotificationPreferences {
  daily_meds_enabled: boolean;
  single_med_enabled: boolean;
  appointments_enabled: boolean;
}

// ── Admin ─────────────────────────────────────────────────────────────────
/** Forma plana que devuelve el backend en GET /admin/stats. */
export interface AdminStats {
  total_users: number;
  users_this_week: number;
  users_this_month: number;
  active_users_last_7_days: number;
  total_medical_history: number;
  total_medications: number;
  total_exams: number;
  total_access_codes_generated: number;
  /** Registros por día, últimos 30 días. */
  signups_by_day: { date: string; count: number }[];
}

export interface AdminUserRow {
  id: string;
  nombre: string;
  email: string;
  created_at: string;
  last_login_at?: string | null;
  history_count: number;
  exam_count: number;
}

export interface AdminUsersPage {
  users: AdminUserRow[];
  total: number;
  page: number;
  limit: number;
}

export interface AdminUsersParams {
  page?: number;
  limit?: number;
  search?: string;
}

/** Detalle de un usuario — solo conteos y metadatos, nunca contenido médico. */
export interface AdminUserDetail extends AdminUserRow {
  fecha_nacimiento?: string;
  tipo_sangre?: string;
  activo: boolean;
  role?: UserRole;
  medication_count: number;
  allergy_count: number;
  vaccine_count: number;
  access_code_count: number;
}
