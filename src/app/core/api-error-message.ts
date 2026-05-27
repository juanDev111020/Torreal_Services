import { HttpErrorResponse } from '@angular/common/http';

/** No mostrar al usuario detalles técnicos de BD, SQL o configuración del servidor. */
const PATRON_TECNICO =
  /sql|mysql|jdbc|hibernate|init\.sql|application\.properties|docker compose|unknown column|unknown database|tabla usuarios|base de datos no coincide|esquema|42S22|42S02|doesn't exist/i;

function extraerMensajeServidor(err: HttpErrorResponse): string {
  const raw = err.error;
  if (raw && typeof raw === 'object' && raw !== null && 'error' in raw) {
    return String((raw as { error?: string }).error).trim();
  }
  if (typeof raw === 'string') {
    return raw.trim();
  }
  return '';
}

function esMensajeSeguro(msg: string): boolean {
  if (!msg || msg.length > 180) return false;
  return !PATRON_TECNICO.test(msg);
}

export interface OpcionesMensajeErrorApi {
  /** Texto por defecto si el error es técnico o no hay mensaje usable. */
  fallback: string;
  sinConexion?: string;
  sesionExpirada?: string;
  sinPermiso?: string;
}

/**
 * Mensaje apto para mostrar en la UI (sin exponer SQL, init.sql ni diagnósticos de servidor).
 */
export function mensajeErrorApi(err: unknown, opciones: OpcionesMensajeErrorApi): string {
  const {
    fallback,
    sinConexion = 'No se pudo conectar con el servidor. Intenta de nuevo más tarde.',
    sesionExpirada = 'Sesión expirada. Vuelve a iniciar sesión.',
    sinPermiso = 'No tienes permiso para realizar esta acción.',
  } = opciones;

  if (!(err instanceof HttpErrorResponse)) {
    return fallback;
  }

  if (err.status === 0) {
    return sinConexion;
  }
  if (err.status === 401) {
    return sesionExpirada;
  }
  if (err.status === 403) {
    return sinPermiso;
  }

  const servidor = extraerMensajeServidor(err);

  if (err.status >= 500) {
    return fallback;
  }

  if (servidor && esMensajeSeguro(servidor)) {
    return servidor;
  }

  return fallback;
}
