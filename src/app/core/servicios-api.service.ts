import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';

export interface ServicioPublico {
  id: number;
  nombre: string;
  descripcion: string;
}

@Injectable({ providedIn: 'root' })
export class ServiciosApiService {
  private readonly http = inject(HttpClient);

  listar(): Observable<ServicioPublico[]> {
    return this.http.get<ServicioPublico[]>(`${API_BASE_URL}/api/servicios`);
  }
}
