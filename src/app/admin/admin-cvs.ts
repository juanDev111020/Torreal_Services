import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { AdminApiService, AdminPostulacion } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';

@Component({
  selector: 'app-admin-cvs',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-cvs.html',
  styleUrl: './admin-cvs.scss',
})
export class AdminCvs implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly lista = signal<AdminPostulacion[]>([]);
  readonly abriendoCvId = signal<number | null>(null);

  ngOnInit(): void {
    this.api.listarPostulaciones().subscribe({
      next: (rows) => {
        this.lista.set(rows);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeErrorApi(err, { fallback: 'No se pudieron cargar las postulaciones.' }));
        this.cargando.set(false);
      },
    });
  }

  cvDisponible(p: AdminPostulacion): boolean {
    return p.cvDisponible === true || p.cv_disponible === true;
  }

  verCv(postulacion: AdminPostulacion): void {
    if (!this.cvDisponible(postulacion)) {
      this.error.set(
        'El PDF no está en el servidor (registro de prueba o archivo eliminado). Sube una postulación nueva desde la página de inicio.',
      );
      return;
    }
    this.error.set(null);
    this.abriendoCvId.set(postulacion.id);
    this.api.obtenerCvPostulacion(postulacion.id).subscribe({
      next: (blob) => {
        this.abriendoCvId.set(null);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 120_000);
      },
      error: (err) => {
        this.abriendoCvId.set(null);
        this.error.set(
          mensajeErrorApi(err, {
            fallback: 'No se pudo abrir el CV.',
            sesionExpirada: 'Sesión expirada. Vuelve a iniciar sesión como super usuario.',
          }),
        );
      },
    });
  }
}
