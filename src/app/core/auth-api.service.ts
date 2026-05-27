import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';
import type { SesionUsuario } from './auth.service';

export interface LoginRespuesta {
  token: string;
  usuario: SesionUsuario;
}

export type RegistroClientePayload = {
  tipo: 'cliente';
  email: string;
  password: string;
  nombreCompleto: string;
  telefono: string;
  tipoCliente: 'natural' | 'propiedad_horizontal';
  direccion: string;
  nitPh: string | null;
  personaContacto: string | null;
};

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(email: string, password: string): Observable<LoginRespuesta> {
    return this.http.post<LoginRespuesta>(`${API_BASE_URL}/api/auth/login`, { email, password });
  }

  registrar(body: RegistroClientePayload): Observable<{ ok: boolean }> {
    return this.http.post<{ ok: boolean }>(`${API_BASE_URL}/api/auth/register`, body);
  }
}
