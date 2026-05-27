import { DatePipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';

import { AdminAgendamiento, AdminApiService } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';

@Component({
  selector: 'app-admin-agendamientos',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-agendamientos.html',
  styleUrl: './admin-agendamientos.scss',
})
export class AdminAgendamientos implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly lista = signal<AdminAgendamiento[]>([]);

  ngOnInit(): void {
    this.api.listarAgendamientos().subscribe({
      next: (rows) => {
        this.lista.set(rows);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeErrorApi(err, { fallback: 'No se pudieron cargar los agendamientos.' }));
        this.cargando.set(false);
      },
    });
  }

  claseEstadoAgendamiento(a: AdminAgendamiento): string {
    const e = (a.estado ?? '').trim().toLowerCase();
    if (e.includes('cancelado')) {
      return 'admin-pill admin-pill--cancelado';
    }
    if (e.includes('finalizado') && this.servicioYaFinalizo(a.fechaFin)) {
      return 'admin-pill admin-pill--finalizado';
    }
    if (e.includes('finalizado')) {
      return 'admin-pill admin-pill--info';
    }
    if (e.includes('proceso')) {
      return 'admin-pill admin-pill--proceso';
    }
    if (e.includes('pendiente')) {
      return 'admin-pill admin-pill--pendiente';
    }
    if (e.includes('pagado')) {
      return 'admin-pill admin-pill--pagado';
    }
    return 'admin-pill admin-pill--info';
  }

  private servicioYaFinalizo(fechaFin: string): boolean {
    if (!fechaFin) return false;
    const fin = new Date(fechaFin);
    if (Number.isNaN(fin.getTime())) return false;
    return fin.getTime() < Date.now();
  }
}
