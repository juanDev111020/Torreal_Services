import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from './api-base-url';

export interface CrearPostulacionDatos {
  nombreCompleto: string;
  correoElectronico: string;
}

export interface CrearPostulacionRespuesta {
  id: number;
}

@Injectable({ providedIn: 'root' })
export class PostulacionesApiService {
  private readonly http = inject(HttpClient);

  /**
   * Envía multipart/form-data: PDF opcional en el campo `cv`.
   * El campo de texto sigue llamándose correoElectronico en el form; el servidor lo guarda en `correo`.
   */
  crear(datos: CrearPostulacionDatos, archivoPdf: File | null): Observable<CrearPostulacionRespuesta> {
    const fd = new FormData();
    fd.append('nombreCompleto', datos.nombreCompleto);
    fd.append('correoElectronico', datos.correoElectronico);
    if (archivoPdf) {
      fd.append('cv', archivoPdf, archivoPdf.name);
    }

    return this.http.post<CrearPostulacionRespuesta>(
      `${API_BASE_URL}/api/postulaciones`,
      fd,
    );
  }
}
