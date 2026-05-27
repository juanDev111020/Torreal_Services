import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, resource, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';

import { AgendamientoEmpleado, EmpleadoApiService } from '../core/empleado-api.service';

const DIAS_SEMANA = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
const MESES_LARGO = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];
const DIAS_LARGO = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

function fechaClaveLocal(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

function inicioDiaLocal(iso: string): Date {
  const d = new Date(iso);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function matrizMes(year: number, monthIndex: number): (number | null)[][] {
  const first = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  const jsDow = first.getDay();
  const lead = (jsDow + 6) % 7;
  const cells: (number | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= lastDay; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function esDomingo(year: number, monthIndex: number, day: number): boolean {
  return new Date(year, monthIndex, day).getDay() === 0;
}

function formatoFechaLarga(d: Date): string {
  return `${DIAS_LARGO[d.getDay()]} ${d.getDate()} de ${MESES_LARGO[d.getMonth()]} de ${d.getFullYear()}`;
}

function horaColombia(iso: string): string {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(iso));
}

@Component({
  selector: 'app-calendario-trabajo',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendario-trabajo.html',
  styleUrl: './calendario-trabajo.scss',
})
export class CalendarioTrabajo {
  private readonly api = inject(EmpleadoApiService);

  readonly anio = signal(new Date().getFullYear());
  readonly claveDiaSeleccion = signal<string | null>(null);

  readonly agendamientosRes = resource<AgendamientoEmpleado[], { y: number }>({
    params: () => ({ y: this.anio() }),
    loader: ({ params }) => firstValueFrom(this.api.misAgendamientos(params.y)),
  });

  readonly lista = computed(() => this.agendamientosRes.value() ?? []);

  readonly clavesConServicio = computed(() => {
    const set = new Set<string>();
    for (const a of this.lista()) {
      set.add(fechaClaveLocal(inicioDiaLocal(a.fechaProgramada)));
    }
    return set;
  });

  readonly detalle = computed(() => {
    const items = this.lista();
    if (!items.length) return null;
    const ordenados = [...items].sort(
      (a, b) => new Date(a.fechaProgramada).getTime() - new Date(b.fechaProgramada).getTime(),
    );
    const clave = this.claveDiaSeleccion();
    if (clave) {
      return (
        ordenados.find((a) => fechaClaveLocal(inicioDiaLocal(a.fechaProgramada)) === clave) ?? null
      );
    }
    const inicioHoy = new Date();
    inicioHoy.setHours(0, 0, 0, 0);
    const t0 = inicioHoy.getTime();
    const futuro = ordenados.find((a) => new Date(a.fechaProgramada).getTime() >= t0);
    return futuro ?? ordenados[0];
  });

  readonly mesesIndices = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

  mesTitulo(m: number): string {
    return MESES_LARGO[m].charAt(0).toUpperCase() + MESES_LARGO[m].slice(1);
  }

  matriz(m: number): (number | null)[][] {
    return matrizMes(this.anio(), m);
  }

  colDomingo(col: number): boolean {
    return col === 6;
  }

  celdaDomingo(m: number, day: number | null, col: number): boolean {
    if (day == null) return this.colDomingo(col);
    return esDomingo(this.anio(), m, day);
  }

  tieneServicio(m: number, day: number | null): boolean {
    if (day == null) return false;
    const d = new Date(this.anio(), m, day);
    return this.clavesConServicio().has(fechaClaveLocal(d));
  }

  esDiaDetalle(m: number, day: number | null): boolean {
    const d = this.detalle();
    if (!d || day == null) return false;
    const t = inicioDiaLocal(d.fechaProgramada);
    return t.getFullYear() === this.anio() && t.getMonth() === m && t.getDate() === day;
  }

  alElegirDia(m: number, day: number | null): void {
    if (day == null) return;
    const d = new Date(this.anio(), m, day);
    const clave = fechaClaveLocal(d);
    if (this.clavesConServicio().has(clave)) {
      this.claveDiaSeleccion.set(clave);
    } else {
      this.claveDiaSeleccion.set(null);
    }
  }

  textoFechaProgramada(): string {
    const d = this.detalle();
    if (!d) return '—';
    return formatoFechaLarga(inicioDiaLocal(d.fechaProgramada));
  }

  textoHoraInicio(): string {
    const d = this.detalle();
    if (!d) return '—';
    return horaColombia(d.fechaProgramada);
  }

  textoHoraFin(): string {
    const d = this.detalle();
    if (!d) return '—';
    if (d.fechaFinServicio) return horaColombia(d.fechaFinServicio);
    return '—';
  }

  totalServiciosAnio(): number {
    return this.lista().length;
  }

  mesTieneServicios(m: number): boolean {
    const y = this.anio();
    for (const a of this.lista()) {
      const t = inicioDiaLocal(a.fechaProgramada);
      if (t.getFullYear() === y && t.getMonth() === m) return true;
    }
    return false;
  }

  mesContieneSeleccion(m: number): boolean {
    const d = this.detalle();
    if (!d) return false;
    const t = inicioDiaLocal(d.fechaProgramada);
    return t.getFullYear() === this.anio() && t.getMonth() === m;
  }

  claseEstadoBadge(estado: string): string {
    const e = (estado ?? '').trim().toLowerCase();
    if (e.includes('proceso')) return 'cal-estado-badge cal-estado-badge--proceso';
    if (e.includes('pendiente')) return 'cal-estado-badge cal-estado-badge--pendiente';
    if (e.includes('pagado')) return 'cal-estado-badge cal-estado-badge--pagado';
    if (e.includes('finalizado')) return 'cal-estado-badge cal-estado-badge--finalizado';
    if (e.includes('cancelado')) return 'cal-estado-badge cal-estado-badge--cancelado';
    return 'cal-estado-badge cal-estado-badge--default';
  }

  anioAnterior(): void {
    this.anio.update((y) => y - 1);
    this.claveDiaSeleccion.set(null);
  }

  anioSiguiente(): void {
    this.anio.update((y) => y + 1);
    this.claveDiaSeleccion.set(null);
  }

  errorCarga(): string | null {
    const e = this.agendamientosRes.error();
    if (!e) return null;
    if (e instanceof HttpErrorResponse && e.status === 401) {
      return 'Sesión expirada. Vuelve a iniciar sesión.';
    }
    if (e instanceof HttpErrorResponse && e.error && typeof e.error === 'object' && 'error' in e.error) {
      const msg = String((e.error as { error?: string }).error ?? '').trim();
      if (msg) return msg;
    }
    return 'No se pudieron cargar los agendamientos.';
  }

  readonly diasSemana = DIAS_SEMANA;
}
