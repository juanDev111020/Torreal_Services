import { Injectable, signal } from '@angular/core';

export interface SesionUsuario {
  id: number;
  email: string;
  rol: string;
  /** Incluido al iniciar sesión; puede faltar en sesiones antiguas en localStorage. */
  nombreCompleto?: string;
}

const STORAGE_KEY = 'torreal_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly sesion = signal<SesionUsuario | null>(null);
  readonly token = signal<string | null>(null);

  constructor() {
    this.restaurarSesion();
  }

  restaurarSesion(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const data = JSON.parse(raw) as { token?: string; usuario?: SesionUsuario };
      const token = typeof data.token === 'string' ? data.token.trim() : '';
      if (token && data.usuario) {
        this.token.set(token);
        this.sesion.set(data.usuario);
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  /** Token JWT actual (signal + respaldo en localStorage por si el interceptor corre antes del signal). */
  obtenerToken(): string | null {
    const actual = this.token()?.trim();
    if (actual) return actual;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const data = JSON.parse(raw) as { token?: string };
      const t = typeof data.token === 'string' ? data.token.trim() : '';
      return t || null;
    } catch {
      return null;
    }
  }

  /** Cabeceras HTTP con Bearer para la API protegida. */
  authorizationHeaders(): Record<string, string> {
    const token = this.obtenerToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  guardarSesion(token: string, usuario: SesionUsuario): void {
    const t = token.trim();
    if (!t) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token: t, usuario }));
    this.token.set(t);
    this.sesion.set(usuario);
  }

  cerrarSesion(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.token.set(null);
    this.sesion.set(null);
  }
}
