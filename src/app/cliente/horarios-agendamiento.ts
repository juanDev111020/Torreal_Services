/** Franjas: 8:00–12:00 y 14:00–18:00, solo en punto y media (formato 24h HH:mm). */
export const HORARIOS_AGENDAMIENTO_24H = [
  '08:00',
  '08:30',
  '09:00',
  '09:30',
  '10:00',
  '10:30',
  '11:00',
  '11:30',
  '12:00',
  '14:00',
  '14:30',
  '15:00',
  '15:30',
  '16:00',
  '16:30',
  '17:00',
  '17:30',
  '18:00',
] as const;

export type HorarioAgendamiento24h = (typeof HORARIOS_AGENDAMIENTO_24H)[number];

const SET_PERMITIDOS = new Set<string>(HORARIOS_AGENDAMIENTO_24H);

export function esHorarioAgendamientoPermitido(hora: string): boolean {
  return SET_PERMITIDOS.has(hora?.trim() ?? '');
}

/** Etiqueta para el usuario (ej. 8:00 a.m.). */
export function etiquetaHorarioAgendamiento(hora24: string): string {
  const [hStr, mStr] = hora24.split(':');
  const h = Number(hStr);
  const m = mStr ?? '00';
  if (Number.isNaN(h)) return hora24;
  const periodo = h < 12 ? 'a.m.' : 'p.m.';
  const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h === 12 ? 12 : h;
  return `${h12}:${m} ${periodo}`;
}

export const HORARIOS_AGENDAMIENTO_OPCIONES = HORARIOS_AGENDAMIENTO_24H.map((v) => ({
  value: v,
  label: etiquetaHorarioAgendamiento(v),
}));

/** Fin de jornada matutina y inicio vespertina; entre ambos no cuenta (almuerzo 12:00–14:00). */
const FIN_MANANA_MIN = 12 * 60;
const INICIO_TARDE_MIN = 14 * 60;

function aMinutos(hora24: string): number {
  const [h, m] = hora24.split(':').map(Number);
  if ([h, m].some((n) => Number.isNaN(n))) return 0;
  return h * 60 + m;
}

/**
 * Horas laborables en un día: solo franjas 8:00–12:00 y 14:00–18:00;
 * el intervalo 12:00–14:00 no se suma aunque el turno lo cruce.
 */
export function calcularHorasLaborablesPorDia(horaInicio: string, horaFin: string): number {
  const inicio = aMinutos(horaInicio);
  const fin = aMinutos(horaFin);
  if (fin <= inicio) return 0;

  let minutos = 0;

  if (inicio < FIN_MANANA_MIN) {
    const finManana = Math.min(fin, FIN_MANANA_MIN);
    if (finManana > inicio) {
      minutos += finManana - inicio;
    }
  }

  if (fin > INICIO_TARDE_MIN) {
    const inicioTarde = Math.max(inicio, INICIO_TARDE_MIN);
    if (fin > inicioTarde) {
      minutos += fin - inicioTarde;
    }
  }

  return Math.round((minutos / 60) * 10) / 10;
}
