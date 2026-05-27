/**
 * NIT Colombia: base 9–10 dígitos (puntos opcionales), guion, DV de un dígito.
 * Ej.: "890.903.938 - 8" → { ok: true, nit: "890903938-8" }
 */

function validarYNormalizarNitPh(input) {
  const raw = String(input ?? '').trim();
  if (!raw) {
    return { ok: false, error: 'El NIT / identificación de la propiedad horizontal es obligatorio.', nit: null };
  }

  const partes = raw.split(/\s*-\s*/);
  if (partes.length !== 2) {
    return {
      ok: false,
      error: 'Indica el guion entre la base y el DV (ejemplo: 890.903.938 - 8).',
      nit: null,
    };
  }

  const baseDigitos = partes[0].replace(/[.\s]/g, '');
  const dv = partes[1].replace(/\s/g, '');

  if (!/^\d+$/.test(baseDigitos)) {
    return {
      ok: false,
      error: 'La base del NIT solo debe contener dígitos (puede usar puntos como separadores).',
      nit: null,
    };
  }
  if (baseDigitos.length < 9 || baseDigitos.length > 10) {
    return {
      ok: false,
      error: 'La base del NIT debe tener entre 9 y 10 dígitos (sin contar el dígito de verificación).',
      nit: null,
    };
  }
  if (!/^\d$/.test(dv)) {
    return {
      ok: false,
      error: 'El dígito de verificación (DV) debe ser un solo número (0-9).',
      nit: null,
    };
  }

  return { ok: true, error: null, nit: `${baseDigitos}-${dv}` };
}

module.exports = { validarYNormalizarNitPh };
