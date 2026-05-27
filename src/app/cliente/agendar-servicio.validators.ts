import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

import { esHorarioAgendamientoPermitido } from './horarios-agendamiento';

const ZONA = 'America/Bogota';

function hoyIso(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

function ahoraEnZona(): { fecha: string; hora: string } {
  const d = new Date();
  const fecha = new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(d);
  const hora = new Intl.DateTimeFormat('en-GB', {
    timeZone: ZONA,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(d);
  return { fecha, hora };
}

export function fechasAgendamientoValidator(group: AbstractControl): ValidationErrors | null {
  const g = group as FormGroup;
  const fechaInicio = String(g.get('fechaInicio')?.value ?? '');
  const fechaFin = String(g.get('fechaFin')?.value ?? '');
  const horaInicio = String(g.get('horaInicio')?.value ?? '');
  const horaFin = String(g.get('horaFin')?.value ?? '');

  if (!fechaInicio && !fechaFin && !horaInicio && !horaFin) {
    return null;
  }

  if (horaInicio && !esHorarioAgendamientoPermitido(horaInicio)) {
    return { horaInicioNoPermitida: true };
  }
  if (horaFin && !esHorarioAgendamientoPermitido(horaFin)) {
    return { horaFinNoPermitida: true };
  }

  const hoy = hoyIso();
  const { fecha: hoyFecha, hora: horaActual } = ahoraEnZona();

  if (fechaInicio && fechaInicio < hoy) {
    return { fechaInicioPasada: true };
  }
  if (fechaFin && fechaFin < hoy) {
    return { fechaFinPasada: true };
  }
  if (fechaInicio && fechaFin && fechaFin < fechaInicio) {
    return { rangoFechasInvalido: true };
  }

  if (fechaInicio === hoyFecha && horaInicio && horaInicio <= horaActual) {
    return { horaInicioPasada: true };
  }

  if (fechaFin === hoyFecha && horaFin && horaFin <= horaActual) {
    return { horaFinPasada: true };
  }

  if (fechaInicio && fechaFin && fechaInicio === fechaFin && horaInicio && horaFin) {
    if (horaFin <= horaInicio) {
      return { horaFinAntesInicio: true };
    }
  }

  return null;
}

export function mensajeErrorFechas(errors: ValidationErrors | null): string | null {
  if (!errors) return null;
  if (errors['horaInicioNoPermitida'] || errors['horaFinNoPermitida']) {
    return 'Solo puedes elegir horas de 8:00 a.m. a 12:00 p.m. o de 2:00 p.m. a 6:00 p.m., en punto o y media.';
  }
  if (errors['fechaInicioPasada']) {
    return 'La fecha de inicio no puede ser anterior a hoy.';
  }
  if (errors['fechaFinPasada']) {
    return 'La fecha de fin no puede ser anterior a hoy.';
  }
  if (errors['rangoFechasInvalido']) {
    return 'La fecha de fin no puede ser anterior a la de inicio.';
  }
  if (errors['horaInicioPasada']) {
    return 'La hora de inicio no puede ser anterior a la hora actual.';
  }
  if (errors['horaFinPasada']) {
    return 'La hora de fin no puede ser anterior a la hora actual.';
  }
  if (errors['horaFinAntesInicio']) {
    return 'La hora de fin debe ser posterior a la hora de inicio.';
  }
  return 'Revisa las fechas y horas del agendamiento.';
}
