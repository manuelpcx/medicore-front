/**
 * Sanea un valor `returnTo` (típicamente un query param) para permitir sólo
 * rutas internas seguras y prevenir open-redirect a hosts externos.
 *
 * Acepta únicamente strings que:
 *  - empiezan por un único `/` (ruta interna),
 *  - NO empiezan por `//` ni `/\` (protocol-relative → host externo),
 *  - no contienen un esquema (`http:`, `javascript:`, etc.).
 *
 * En cualquier otro caso devuelve `null` para que el llamador use su destino
 * por defecto.
 */
export function safeReturnTo(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== 'string') return null;

  // Debe ser una ruta absoluta interna: empieza por un único '/'.
  if (raw[0] !== '/') return null;

  // Rechaza protocol-relative ('//host' o '/\host').
  if (raw[1] === '/' || raw[1] === '\\') return null;

  // Rechaza cualquier esquema explícito (p. ej. 'http:' embebido).
  if (raw.includes(':')) return null;

  return raw;
}
