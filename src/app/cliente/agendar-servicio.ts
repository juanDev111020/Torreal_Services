import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { mensajeErrorApi } from '../core/api-error-message';
import { AuthService } from '../core/auth.service';
import { ClienteApiService } from '../core/cliente-api.service';
import { ServicioPublico, ServiciosApiService } from '../core/servicios-api.service';
import {
  fechasAgendamientoValidator,
  mensajeErrorFechas,
} from './agendar-servicio.validators';
import {
  calcularCostoEstimado,
  formatearPesosColombia,
} from './calcular-costo-servicio';
import {
  calcularHorasLaborablesPorDia,
  etiquetaHorarioAgendamiento,
  HORARIOS_AGENDAMIENTO_OPCIONES,
} from './horarios-agendamiento';
import {
  esClientePropiedadHorizontal,
  tarifaClienteAMapa,
} from './tarifa-cliente.util';

const ZONA = 'America/Bogota';

export interface ResumenAgendamientoModal {
  servicio: string;
  esPh: boolean;
  nombrePropiedad: string;
  nombres: string;
  apellidos: string;
  correo: string;
  direccion: string;
  nit: string;
  diasServicio: string;
  horarioDiario: string;
  horasPorDia: string;
  tiempoTotal: string;
  precioPorHora: string | null;
  costoEstimado: string | null;
  tieneTarifa: boolean;
  sinTarifa: boolean;
}

@Component({
  selector: 'app-agendar-servicio',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './agendar-servicio.html',
  styleUrl: './agendar-servicio.scss',
})
export class AgendarServicio implements OnInit, OnDestroy {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly serviciosApi = inject(ServiciosApiService);
  private readonly clienteApi = inject(ClienteApiService);
  private readonly router = inject(Router);

  readonly servicios = signal<ServicioPublico[]>([]);
  readonly cargandoServicios = signal(true);
  readonly cargandoPerfil = signal(true);
  readonly modalAbierto = signal(false);
  readonly enviando = signal(false);
  readonly mensajeError = signal<string | null>(null);
  readonly esPropiedadHorizontal = signal(false);

  private readonly perfilPorDefecto = signal({ direccion: '', nit: '' });
  /** idServicio → precio por hora según tipo de cliente (Natural / PH). */
  private readonly preciosPorServicio = signal<Record<number, number>>({});

  /** Resumen recalculado al abrir el modal y al cambiar el formulario con el modal abierto. */
  readonly resumenModal = signal<ResumenAgendamientoModal | null>(null);

  private subActualizarResumenModal: Subscription | null = null;

  readonly fechaMinima = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
  readonly horariosOpciones = HORARIOS_AGENDAMIENTO_OPCIONES;
  readonly etiquetaHora = etiquetaHorarioAgendamiento;

  readonly form = this.fb.group(
    {
      idServicio: ['', Validators.required],
      nombreCompleto: [{ value: '', disabled: true }, Validators.required],
      correo: [{ value: '', disabled: true }, [Validators.required, Validators.email]],
      direccion: ['', [Validators.required, Validators.maxLength(30)]],
      nit: [''],
      fechaInicio: ['', Validators.required],
      fechaFin: ['', Validators.required],
      horaInicio: ['08:00', Validators.required],
      horaFin: ['18:00', Validators.required],
    },
    { validators: fechasAgendamientoValidator },
  );

  ngOnInit(): void {
    this.serviciosApi.listar().subscribe({
      next: (lista) => {
        this.servicios.set(lista);
        this.cargandoServicios.set(false);
      },
      error: () => {
        this.cargandoServicios.set(false);
        this.mensajeError.set('No se pudieron cargar los servicios.');
      },
    });

    this.clienteApi.miPerfil().subscribe({
      next: (p) => {
        const ph = esClientePropiedadHorizontal(p.tipoCliente);
        this.esPropiedadHorizontal.set(ph);
        const direccion = p.direccion?.trim() ?? '';
        const nit = p.nitPh?.trim() ?? '';
        this.perfilPorDefecto.set({ direccion, nit });

        this.form.patchValue({
          nombreCompleto: p.nombreCompleto,
          correo: p.email,
          direccion,
          nit: ph ? nit : '',
        });
        this.cargarTarifas();
      },
      error: (err: unknown) => {
        const u = this.auth.sesion();
        if (u) {
          this.form.patchValue({
            nombreCompleto: u.nombreCompleto ?? '',
            correo: u.email ?? '',
          });
        }
        this.cargarTarifas();
        if (err instanceof HttpErrorResponse && err.status === 401) {
          this.mensajeError.set('Sesión expirada. Vuelve a iniciar sesión.');
          return;
        }
        if (err instanceof HttpErrorResponse && err.status === 403) {
          this.mensajeError.set('Tu cuenta no tiene rol de cliente.');
          return;
        }
        this.mensajeError.set(null);
      },
    });
  }

  ngOnDestroy(): void {
    this.detenerActualizacionResumenModal();
  }

  abrirConfirmacion(): void {
    this.mensajeError.set(null);
    this.form.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      const fechasMsg = mensajeErrorFechas(this.form.errors);
      this.mensajeError.set(
        fechasMsg ?? 'Completa todos los campos obligatorios y revisa fechas y horas.',
      );
      return;
    }
    this.cargarTarifas(() => {
      this.actualizarResumenModal();
      this.modalAbierto.set(true);
      this.iniciarActualizacionResumenModal();
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.detenerActualizacionResumenModal();
  }

  limpiar(): void {
    const def = this.perfilPorDefecto();
    this.form.patchValue({
      idServicio: '',
      direccion: def.direccion,
      nit: def.nit,
      fechaInicio: '',
      fechaFin: '',
      horaInicio: '08:00',
      horaFin: '18:00',
    });
    this.mensajeError.set(null);
  }

  confirmarAgendamiento(): void {
    const v = this.form.getRawValue();
    this.enviando.set(true);
    this.mensajeError.set(null);

    this.clienteApi
      .crearAgendamiento({
        idServicio: Number(v.idServicio),
        direccion: v.direccion.trim(),
        nit: v.nit.trim(),
        fechaInicio: v.fechaInicio,
        fechaFin: v.fechaFin,
        horaInicio: v.horaInicio,
        horaFin: v.horaFin,
        nombreCliente: (v.nombreCompleto ?? '').trim(),
      })
      .subscribe({
        next: () => {
          this.enviando.set(false);
          this.modalAbierto.set(false);
          void this.router.navigate(['/cliente/perfil']);
        },
        error: (err: unknown) => {
          this.enviando.set(false);
          this.mensajeError.set(this.mensajeDesdeError(err));
        },
      });
  }

  private mensajeDesdeError(err: unknown): string {
    return mensajeErrorApi(err, {
      fallback: 'No se pudo registrar el agendamiento. Intenta de nuevo más tarde.',
      sinConexion:
        'No se pudo conectar con el servidor. Verifica que la API esté en marcha y recarga la página.',
      sesionExpirada: 'Sesión expirada. Cierra sesión e inicia de nuevo como cliente.',
      sinPermiso: 'Tu usuario no tiene permiso de cliente para agendar.',
    });
  }

  private partirNombre(completo: string): { nombres: string; apellidos: string } {
    const p = completo.trim().split(/\s+/);
    if (p.length <= 1) {
      return { nombres: completo || '—', apellidos: '—' };
    }
    return { nombres: p[0], apellidos: p.slice(1).join(' ') };
  }

  private formatearFecha(iso: string): string {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  /** Días calendario en los que se contrata el servicio (inclusive). */
  private cargarTarifas(alTerminar?: () => void): void {
    this.clienteApi.listarTarifas().subscribe({
      next: (lista) => {
        const mapa = tarifaClienteAMapa(lista);
        this.preciosPorServicio.set(mapa);
        this.cargandoPerfil.set(false);
        if (Object.keys(mapa).length === 0) {
          this.mensajeError.set(
            'No hay tarifas configuradas para tu tipo de cliente. Contacta a Torreal.',
          );
        }
        alTerminar?.();
      },
      error: (err: unknown) => {
        this.preciosPorServicio.set({});
        this.cargandoPerfil.set(false);
        this.mensajeError.set(
          mensajeErrorApi(err, {
            fallback: 'No se pudieron cargar las tarifas. Verifica que la API esté en marcha.',
            sesionExpirada: 'Sesión expirada. Vuelve a iniciar sesión.',
            sinPermiso: 'Tu usuario no tiene permiso de cliente para ver tarifas.',
          }),
        );
        alTerminar?.();
      },
    });
  }

  private actualizarResumenModal(): void {
    this.resumenModal.set(this.construirResumen());
  }

  private iniciarActualizacionResumenModal(): void {
    this.detenerActualizacionResumenModal();
    this.subActualizarResumenModal = this.form.valueChanges.subscribe(() => {
      if (this.modalAbierto()) {
        this.actualizarResumenModal();
      }
    });
  }

  private detenerActualizacionResumenModal(): void {
    this.subActualizarResumenModal?.unsubscribe();
    this.subActualizarResumenModal = null;
  }

  private construirResumen(): ResumenAgendamientoModal {
    const v = this.form.getRawValue();
    const ph = this.esPropiedadHorizontal();
    const serv = this.servicios().find((s) => String(s.id) === v.idServicio);
    const partes = this.partirNombre(v.nombreCompleto);
    const dias = this.contarDiasServicio(v.fechaInicio, v.fechaFin);
    const horasPorDia = calcularHorasLaborablesPorDia(v.horaInicio, v.horaFin);
    const idServ = Number(v.idServicio);
    const precioHora = idServ > 0 ? this.preciosPorServicio()[idServ] : undefined;
    const costoNum =
      precioHora != null
        ? calcularCostoEstimado(precioHora, dias, horasPorDia)
        : null;

    return {
      servicio: serv?.nombre ?? '—',
      esPh: ph,
      nombrePropiedad: v.nombreCompleto?.trim() || '—',
      nombres: partes.nombres,
      apellidos: partes.apellidos,
      correo: v.correo,
      direccion: v.direccion,
      nit: v.nit || '—',
      diasServicio:
        dias > 0
          ? dias === 1
            ? this.formatearFecha(v.fechaInicio)
            : `Del ${this.formatearFecha(v.fechaInicio)} al ${this.formatearFecha(v.fechaFin)} (${dias} días)`
          : '—',
      horarioDiario:
        v.horaInicio && v.horaFin
          ? `${etiquetaHorarioAgendamiento(v.horaInicio)} a ${etiquetaHorarioAgendamiento(v.horaFin)} (cada día)`
          : '—',
      horasPorDia: horasPorDia > 0 ? `${horasPorDia} h por día` : '—',
      tiempoTotal:
        dias > 0 && horasPorDia > 0 ? `${dias * horasPorDia} h en total` : '—',
      precioPorHora:
        precioHora != null ? formatearPesosColombia(precioHora) + ' / hora' : null,
      costoEstimado:
        costoNum != null ? formatearPesosColombia(costoNum) : null,
      tieneTarifa: precioHora != null,
      sinTarifa: idServ > 0 && precioHora == null,
    };
  }

  private contarDiasServicio(inicio: string, fin: string): number {
    if (!inicio || !fin) return 0;
    const d0 = new Date(`${inicio}T12:00:00`);
    const d1 = new Date(`${fin}T12:00:00`);
    if (Number.isNaN(d0.getTime()) || Number.isNaN(d1.getTime())) return 0;
    const diff = Math.round((d1.getTime() - d0.getTime()) / 86_400_000);
    return diff >= 0 ? diff + 1 : 0;
  }

}
