/** Misma lista que el formulario de postulación / CV (áreas de interés). */
export const ESPECIALIDAD_EMPLEADO_OPCIONES = [
  'Jardinería',
  'Aseo general',
  'Limpieza',
  'Mantenimiento',
  'Salvavidas',
  'Todero',
  'Instalación de CCTV',
  'Conserjería',
] as const;

export type EspecialidadEmpleado = (typeof ESPECIALIDAD_EMPLEADO_OPCIONES)[number];

export function esEspecialidadEmpleadoValida(val: string): val is EspecialidadEmpleado {
  return (ESPECIALIDAD_EMPLEADO_OPCIONES as readonly string[]).includes(val);
}
