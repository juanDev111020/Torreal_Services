import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';
import { AuthService } from './auth.service';

export interface AgendamientoClienteCard {
  id: number;
  servicioNombre: string;
  fechaInicio: string;
  fechaFin: string;
  horarioDiario: string;
  estado: string;
  empleadoNombre: string;
  tipoCobro: string;
  precioPorHora: number;
  totalEstimado: number;
  puedeCancelar: boolean;
}

/** Respuesta típica de Spring en camelCase; snake_case opcional por si cambia configuración Jackson. */
export interface TarifaCliente {
  idServicio: number;
  precioPorHora: number;
  id_servicio?: number;
  precio_por_hora?: number;
}

export interface PerfilClienteDto {
  nombreCompleto: string;
  email: string;
  telefono: string;
  direccion: string;
  tipoCliente: string;
  nitPh: string;
  personaContacto: string;
  estadoCuenta: string;
  activo: boolean;
  agendamientos: AgendamientoClienteCard[];
}

export interface CrearAgendamientoPayload {
  idServicio: number;
  direccion: string;
  nit: string;
  fechaInicio: string;
  fechaFin: string;
  horaInicio: string;
  horaFin: string;
  /** Nombre o propiedad que figura en el formulario al confirmar. */
  nombreCliente: string;
}

export interface AgendamientoCreadoResponse {
  id: number;
  mensaje: string;
  empleadoAsignado: string;
  estado: string;
}

@Injectable({ providedIn: 'root' })
export class ClienteApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  miPerfil(): Observable<PerfilClienteDto> {
    return this.http.get<PerfilClienteDto>(`${API_BASE_URL}/api/cliente/mi-perfil`, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  listarTarifas(): Observable<TarifaCliente[]> {
    return this.http.get<TarifaCliente[]>(`${API_BASE_URL}/api/cliente/tarifas`, {
      headers: this.auth.authorizationHeaders(),
    });
  }

  crearAgendamiento(body: CrearAgendamientoPayload): Observable<AgendamientoCreadoResponse> {
    return this.http.post<AgendamientoCreadoResponse>(
      `${API_BASE_URL}/api/cliente/agendamientos`,
      body,
      { headers: this.auth.authorizationHeaders() },
    );
  }

  cancelarAgendamiento(id: number): Observable<{ error: string }> {
    return this.http.post<{ error: string }>(
      `${API_BASE_URL}/api/cliente/agendamientos/${id}/cancelar`,
      {},
      { headers: this.auth.authorizationHeaders() },
    );
  }
}
