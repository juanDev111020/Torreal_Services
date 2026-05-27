import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';
import { AuthService } from './auth.service';

export interface AgendamientoEmpleado {
  id: number;
  fechaProgramada: string;
  fechaFinServicio: string | null;
  estado: string;
  servicioNombre: string;
  clienteNombre: string;
}

export interface PerfilEmpleadoDto {
  nombreCompleto: string;
  email: string;
  telefono: string;
  especialidad: string;
  estadoLaboral: string;
  estadoCuenta: string;
  activo: boolean;
}

@Injectable({ providedIn: 'root' })
export class EmpleadoApiService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthService);

  misAgendamientos(year: number): Observable<AgendamientoEmpleado[]> {
    return this.http.get<AgendamientoEmpleado[]>(`${API_BASE_URL}/api/empleado/mis-agendamientos`, {
      params: { year: String(year) },
      headers: this.auth.authorizationHeaders(),
    });
  }

  miPerfil(): Observable<PerfilEmpleadoDto> {
    return this.http.get<PerfilEmpleadoDto>(`${API_BASE_URL}/api/empleado/mi-perfil`, {
      headers: this.auth.authorizationHeaders(),
    });
  }
}
