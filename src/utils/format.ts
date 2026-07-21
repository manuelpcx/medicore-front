import { format, formatDistanceToNow, parseISO, isValid, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export function fDate(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, "d 'de' MMMM, yyyy", { locale: es });
}

export function fDateShort(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return format(d, 'dd/MM/yyyy', { locale: es });
}

export function fRelative(dateStr: string | undefined): string {
  if (!dateStr) return '—';
  const d = parseISO(dateStr);
  if (!isValid(d)) return dateStr;
  return formatDistanceToNow(d, { addSuffix: true, locale: es });
}

export function fInputDate(dateStr: string | undefined): string {
  if (!dateStr) return '';
  const d = parseISO(dateStr);
  if (!isValid(d)) return '';
  return format(d, 'yyyy-MM-dd');
}

export function daysUntil(dateStr: string | undefined): number | null {
  if (!dateStr) return null;
  const d = parseISO(dateStr);
  if (!isValid(d)) return null;
  return differenceInDays(d, new Date());
}

export function isSoonDate(dateStr: string | undefined, withinDays = 30): boolean {
  const days = daysUntil(dateStr);
  return days !== null && days >= 0 && days <= withinDays;
}

/** Forma mínima de un error de Axios que interesa a los helpers de esta
 * sección (evita `any` sin modificar el comportamiento existente). */
interface ApiErrorLike {
  response?: {
    status?: number;
    data?: {
      message?: string;
      error?: string;
    };
  };
  message?: string;
}

export function extractError(err: unknown): string {
  if (!err) return 'Error desconocido';
  const e = err as ApiErrorLike;
  return (
    e?.response?.data?.message ||
    e?.response?.data?.error ||
    e?.message ||
    'Error inesperado'
  );
}

/**
 * Detecta específicamente el error 403 del tope de 4 exámenes con archivo
 * del plan Free (ExamsService.assertExamFileQuota, #26). Se distingue por
 * status 403 + el texto "exámenes con archivo" en el campo `error` del
 * cuerpo de respuesta (HttpExceptionFilter, ver requirements.md): ese texto
 * es parte del contrato ya verificado en `#26` (R2 de su spec: "el mensaje
 * de error... DEBE indicar explícitamente el tope de 4 exámenes con
 * archivo"), así que no es un acoplamiento frágil a un string arbitrario.
 * NO cuenta exámenes en el cliente (R12): solo interpreta la respuesta del
 * backend, que es la única fuente de verdad del conteo real.
 */
export function isExamFileQuotaError(err: unknown): boolean {
  const e = err as ApiErrorLike;
  const backendMessage = e?.response?.data?.error;
  return (
    e?.response?.status === 403 &&
    typeof backendMessage === 'string' &&
    backendMessage.toLowerCase().includes('exámenes con archivo')
  );
}

/** Mensaje específico del tope (R10): el texto real del backend si está
 * disponible; si no (llamada defensiva sin la forma esperada), un texto de
 * respaldo equivalente para no dejar el banner vacío. */
export function examFileQuotaMessage(err: unknown): string {
  const e = err as ApiErrorLike;
  return (
    e?.response?.data?.error ||
    'Alcanzaste el tope de exámenes con archivo de tu plan Free.'
  );
}
