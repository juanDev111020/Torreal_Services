import { Component, inject, OnInit, signal } from '@angular/core';

import { AdminApiService, AdminCliente } from '../core/admin-api.service';
import { mensajeErrorApi } from '../core/api-error-message';

@Component({
  selector: 'app-admin-clientes',
  standalone: true,
  imports: [],
  templateUrl: './admin-clientes.html',
  styleUrl: './admin-clientes.scss',
})
export class AdminClientes implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly mensaje = signal<string | null>(null);
  readonly lista = signal<AdminCliente[]>([]);
  readonly procesandoId = signal<number | null>(null);

  ngOnInit(): void {
    this.recargar();
  }

  recargar(): void {
    this.cargando.set(true);
    this.error.set(null);
    this.api.listarClientes().subscribe({
      next: (rows) => {
        this.lista.set(rows);
        this.cargando.set(false);
      },
      error: (err) => {
        this.error.set(mensajeErrorApi(err, { fallback: 'No se pudieron cargar los clientes.' }));
        this.cargando.set(false);
      },
    });
  }

  alternarEstado(c: AdminCliente): void {
    const nuevo = c.activo ? 'inactivo' : 'activo';
    this.procesandoId.set(c.idCliente);
    this.mensaje.set(null);
    this.api.cambiarEstadoCliente(c.idCliente, nuevo).subscribe({
      next: () => {
        this.procesandoId.set(null);
        this.mensaje.set(`Cliente ${nuevo === 'activo' ? 'activado' : 'desactivado'}.`);
        this.recargar();
      },
      error: (err) => {
        this.procesandoId.set(null);
        this.mensaje.set(mensajeErrorApi(err, { fallback: 'No se pudo cambiar el estado.' }));
      },
    });
  }
}
