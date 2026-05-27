import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, resource } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { AuthService } from '../core/auth.service';
import { EmpleadoApiService, PerfilEmpleadoDto } from '../core/empleado-api.service';

@Component({
  selector: 'app-perfil-empleado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './perfil-empleado.html',
  styleUrl: './perfil-empleado.scss',
})
export class PerfilEmpleado {
  private readonly api = inject(EmpleadoApiService);
  readonly auth = inject(AuthService);

  readonly perfilRes = resource<PerfilEmpleadoDto, unknown>({
    loader: () => firstValueFrom(this.api.miPerfil()),
  });

  errorCarga(): string | null {
    const e = this.perfilRes.error();
    if (!e) return null;
    if (e instanceof HttpErrorResponse && e.status === 401) {
      return 'Sesión expirada. Vuelve a iniciar sesión.';
    }
    return 'No se pudo cargar la información del perfil.';
  }

  iniciales(nombre: string): string {
    const partes = nombre.trim().split(/\s+/).filter(Boolean);
    if (partes.length === 0) return '?';
    if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
    return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
  }

  rolEtiqueta(): string {
    const rol = this.auth.sesion()?.rol?.trim();
    if (!rol) return 'Empleado';
    return rol.charAt(0).toUpperCase() + rol.slice(1).toLowerCase();
  }

  esCuentaActiva(p: PerfilEmpleadoDto): boolean {
    if (typeof p.activo === 'boolean') return p.activo;
    const e = (p.estadoCuenta ?? p.estadoLaboral ?? '').trim().toLowerCase();
    if (!e || e === 'en servicio') return true;
    return e === 'activo';
  }

  esEstadoActivo(estado: string | null | undefined): boolean {
    const e = (estado ?? '').trim().toLowerCase();
    if (!e || e === 'en servicio') return true;
    return e === 'activo';
  }

  etiquetaEstadoLaboral(estado: string | null | undefined): string {
    const v = (estado ?? '').trim();
    if (!v) return 'Activo';
    const lower = v.toLowerCase();
    if (lower === 'inactivo') return 'Inactivo';
    if (lower === 'activo' || lower === 'en servicio') return 'Activo';
    return v.charAt(0).toUpperCase() + v.slice(1).toLowerCase();
  }
}
