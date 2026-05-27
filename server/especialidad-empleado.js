/** Debe coincidir con src/app/core/especialidad-empleado-opciones.ts */
const ESPECIALIDAD_EMPLEADO_OPCIONES = [
  'Jardinería',
  'Aseo general',
  'Limpieza',
  'Mantenimiento',
  'Salvavidas',
  'Todero',
  'Instalación de CCTV',
  'Conserjería',
];

function esEspecialidadValida(val) {
  return ESPECIALIDAD_EMPLEADO_OPCIONES.includes(val);
}

function validarPasswordRegistro(password) {
  if (typeof password !== 'string') return 'Contraseña no válida.';
  if (password.length < 8 || password.length > 16) {
    return 'La contraseña debe tener entre 8 y 16 caracteres.';
  }
  if (!/[A-Z]/.test(password)) {
    return 'La contraseña debe incluir al menos una letra mayúscula (A-Z).';
  }
  return null;
}

function validarTelefonoCo(telefono) {
  if (typeof telefono !== 'string' || !/^\d{10}$/.test(telefono)) {
    return 'El teléfono debe tener exactamente 10 dígitos numéricos.';
  }
  return null;
}

module.exports = {
  ESPECIALIDAD_EMPLEADO_OPCIONES,
  esEspecialidadValida,
  validarPasswordRegistro,
  validarTelefonoCo,
};
