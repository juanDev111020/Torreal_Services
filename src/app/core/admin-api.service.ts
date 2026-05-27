import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';
import { AuthService } from './auth.service';
import { NovedadPublica } from './novedades-api.service';

export interface AdminAgendamiento {
  id: number;
  clienteNombre: string;
  empleadoNombre: string;
  servicioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
}

export interface AdminCliente {
  idCliente: number;
  idUsuario: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  tipoCliente: string;
  estado: string;
  activo: boolean;
  totalAgendamientos: number;
  agendamientosActivos: number;
  tieneAgendamientos: boolean;
}

export interface AdminEmpleado {
  id: number;
  nombreCompleto: string;
  email: string;
  telefono: string;
  especialidad: string;
  estadoLaboral: string;
  activo: boolean;
  ocupado: boolean;
  totalAgendamientos: number;
  agendamientosActivos: number;
}

export interface TokenRegistroEmpleado {
  token: string;
  segundosRestantes: number;
  vigenciaSegundos: number;
}

export interface AdminPostulacion {
  id: number;
  nombreCompleto: string;
  correo: string;
  archivoCvUrl: string | null;
  fechaEnvio: string | null;
  cvDisponible?: boolean;
  cv_disponible?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  private headers() {
    return this.auth.authorizationHeaders();
  }

  obtenerTokenRegistroEmpleado(): Observable<TokenRegistroEmpleado> {
    return this.http.get<TokenRegistroEmpleado>(
      `${API_BASE_URL}/api/admin/token-registro-empleado`,
      { headers: this.headers() },
    );
  }

  listarAgendamientos(): Observable<AdminAgendamiento[]> {
    return this.http.get<AdminAgendamiento[]>(`${API_BASE_URL}/api/admin/agendamientos`, {
      headers: this.headers(),
    });
  }

  listarClientes(): Observable<AdminCliente[]> {
    return this.http.get<AdminCliente[]>(`${API_BASE_URL}/api/admin/clientes`, {
      headers: this.headers(),
    });
  }

  cambiarEstadoCliente(idCliente: number, estado: 'activo' | 'inactivo'): Observable<void> {
    return this.http.patch<void>(
      `${API_BASE_URL}/api/admin/clientes/${idCliente}/estado`,
      { estado },
      { headers: this.headers() },
    );
  }

  listarEmpleados(): Observable<AdminEmpleado[]> {
    return this.http.get<AdminEmpleado[]>(`${API_BASE_URL}/api/admin/empleados`, {
      headers: this.headers(),
    });
  }

  cambiarEstadoEmpleado(id: number, estado: 'activo' | 'inactivo'): Observable<void> {
    return this.http.patch<void>(
      `${API_BASE_URL}/api/admin/empleados/${id}/estado`,
      { estado },
      { headers: this.headers() },
    );
  }

  registrarEmpleado(body: {
    email: string;
    password: string;
    nombreCompleto: string;
    telefono: string;
    especialidad: string;
  }): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(
      `${API_BASE_URL}/api/admin/empleados/registrar`,
      body,
      { headers: this.headers() },
    );
  }

  listarPostulaciones(): Observable<AdminPostulacion[]> {
    return this.http.get<AdminPostulacion[]>(`${API_BASE_URL}/api/admin/postulaciones`, {
      headers: this.headers(),
    });
  }

  /** PDF con JWT (no usar enlace directo a /uploads). */
  obtenerCvPostulacion(id: number): Observable<Blob> {
    return this.http.get(`${API_BASE_URL}/api/admin/postulaciones/${id}/cv`, {
      headers: this.headers(),
      responseType: 'blob',
    });
  }

  listarNovedades(): Observable<NovedadPublica[]> {
    return this.http.get<NovedadPublica[]>(`${API_BASE_URL}/api/admin/novedades`, {
      headers: this.headers(),
    });
  }

  crearNovedad(titulo: string, contenido: string, imagen: File): Observable<NovedadPublica> {
    const fd = new FormData();
    fd.append('titulo', titulo);
    fd.append('contenido', contenido);
    fd.append('imagen', imagen);
    return this.http.post<NovedadPublica>(`${API_BASE_URL}/api/admin/novedades`, fd, {
      headers: this.headers(),
    });
  }

  eliminarNovedad(id: number): Observable<void> {
    return this.http.delete<void>(`${API_BASE_URL}/api/admin/novedades/${id}`, {
      headers: this.headers(),
    });
  }
}
