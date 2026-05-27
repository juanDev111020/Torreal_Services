import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';

export interface NovedadPublica {
  id: number;
  titulo: string;
  contenido: string;
  imagenUrl: string;
}

@Injectable({ providedIn: 'root' })
export class NovedadesApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<NovedadPublica[]> {
    return this.http.get<NovedadPublica[]>(`${API_BASE_URL}/api/novedades`);
  }
}

export function urlArchivoSubido(ruta: string | null | undefined): string {
  if (!ruta) return '';
  const t = ruta.trim();
  if (t.startsWith('http://') || t.startsWith('https://')) return t;
  const path = t.startsWith('/') ? t : `/${t}`;
  return `${API_BASE_URL}${path}`;
}
