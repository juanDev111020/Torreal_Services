import { Component, inject, OnInit, signal } from '@angular/core';

import { AdminApiService, AdminEmpleado } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';

@Component({
  selector: 'app-admin-empleados',
  standalone: true,
  imports: [],
  templateUrl: './admin-empleados.html',
  styleUrl: './admin-empleados.scss',
})
export class AdminEmpleados implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);
  readonly lista = signal<AdminEmpleado[]>([]);
  readonly procesandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.api.listarEmpleados().subscribe({
      next: (rows) => {
        this.lista.set(rows);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeErrorApi(err, { fallback: 'No se pudieron cargar los empleados.' }));
        this.cargando.set(false);
      },
    });
  }

  alternarEstado(e: AdminEmpleado): void {
    const nuevo = e.activo ? 'inactivo' : 'activo';
    this.procesandoId.set(e.id);
    this.mensaje.set(null);
    this.api.cambiarEstadoEmpleado(e.id, nuevo).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.mensaje.set(`Empleado ${nuevo === 'activo' ? 'activado' : 'desactivado'}.`);
        this.recargar();
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.mensaje.set(mensajeErrorApi(err, { fallback: 'No se pudo cambiar el estado.' }));
      },
    });
  }
}
