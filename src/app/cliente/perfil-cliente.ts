import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, resource, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { mensajeErrorApi } from '../core/api-error-message';
import {
  AgendamientoClienteCard,
  ClienteApiService,
  PerfilClienteDto,
} from '../core/cliente-api.service';

@Component({
  selector: 'app-perfil-cliente',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-cliente.html',
  styleUrl: './perfil-cliente.scss',
})
export class PerfilCliente {
  private readonly api = inject(ClienteApiService);

  readonly cancelandoId = signal<number | null>(null);
  readonly mensajeAccion = signal<string | null>(null);

  readonly perfilRes = resource<PerfilClienteDto, unknown>({
    loader: () => firstValueFrom(this.api.miPerfil()),
  });

  errorCarga(): string | null {
    const e = this.perfilRes.error();
    if (!e) return null;
    if (e instanceof HttpErrorResponse && e.status === 401) {
      return 'Sesión expirada. Vuelve a iniciar sesión.';
    }
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) {
        return 'No se pudo conectar con el servidor. Verifica que la API esté en marcha.';
      }
    }
    return 'No se pudo cargar tu perfil.';
  }

  formatoTotal(valor: number): string {
    if (!valor) return '—';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  formatoTarifa(precioPorHora: number): string {
    if (!precioPorHora) return '—';
    return (
      new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }).format(precioPorHora) + ' / hora'
    );
  }

  estaCancelado(estado: string): boolean {
    return estado?.toLowerCase() === 'cancelado';
  }

  esCuentaActiva(p: PerfilClienteDto): boolean {
    if (typeof p.activo === 'boolean') return p.activo;
    return (p.estadoCuenta ?? '').trim().toLowerCase() !== 'inactivo';
  }

  iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  claseEstadoBadge(estado: string): string {
    const e = (estado ?? '').trim().toLowerCase();
    if (e.includes('proceso')) return 'cli-estado-pill cli-estado-pill--proceso';
    if (e.includes('pendiente')) return 'cli-estado-pill cli-estado-pill--pendiente';
    if (e.includes('pagado')) return 'cli-estado-pill cli-estado-pill--pagado';
    if (e.includes('finalizado')) return 'cli-estado-pill cli-estado-pill--finalizado';
    if (e.includes('cancelado')) return 'cli-estado-pill cli-estado-pill--cancelado';
    return 'cli-estado-pill cli-estado-pill--default';
  }

  cancelarReserva(a: AgendamientoClienteCard): void {
    if (!a.puedeCancelar || this.cancelandoId() !== null) return;
    this.mensajeAccion.set(null);
    this.cancelandoId.set(a.id);
    this.api.cancelarAgendamiento(a.id).subscribe({
      next: (r) => {
        this.cancelandoId.set(null);
        this.mensajeAccion.set(r.error || 'Reserva cancelada.');
        this.perfilRes.reload();
      },
      error: (err: unknown) => {
        this.cancelandoId.set(null);
        this.mensajeAccion.set(
          mensajeErrorApi(err, {
            fallback: 'No se pudo cancelar la reserva. Intenta de nuevo.',
          }),
        );
      },
    });
  }
}
