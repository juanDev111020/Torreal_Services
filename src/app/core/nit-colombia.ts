/**
 * NIT Colombia: base numérica de 9 o 10 dígitos (puntos opcionales), guion, dígito de verificación (1 dígito).
 * Ejemplo: 890.903.938 - 8 → se guarda normalizado como 890903938-8
 */

import { AbstractControl, ValidationErrors } from '@angular/forms';

export type ResultadoNit =
  | { ok: true; nit: string }
  | { ok: false; error: string };

export function validarYNormalizarNitPh(input: string): ResultadoNit {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return { ok: false, error: 'El NIT es obligatorio para propiedad horizontal.' };
  }

  const partes = raw.split(/\s*-\s*/);
  if (partes.length !== 2) {
    return {
      ok: false,
      error: 'Indica el guion entre la base y el DV (ejemplo: 890.903.938 - 8).',
    };
  }

  const baseDigitos = partes[0].replace(/[.\s]/g, '');
  const dv = partes[1].replace(/\s/g, '');

  if (!/^\d+$/.test(baseDigitos)) {
    return { ok: false, error: 'La base del NIT solo debe contener dígitos (puede usar puntos como separadores).' };
  }
  if (baseDigitos.length < 9 || baseDigitos.length > 10) {
    return {
      ok: false,
      error: 'La base del NIT debe tener entre 9 y 10 dígitos (sin contar el dígito de verificación).',
    };
  }
  if (!/^\d$/.test(dv)) {
    return { ok: false, error: 'El dígito de verificación (DV) debe ser un solo número (0-9).' };
  }

  return { ok: true, nit: `${baseDigitos}-${dv}` };
}

export function nitPhColombiaValidator(control: AbstractControl): ValidationErrors | null {
  const v = String(control.value ?? '').trim();
  if (!v) return null;
  return validarYNormalizarNitPh(v).ok ? null : { nitInvalido: true };
}
