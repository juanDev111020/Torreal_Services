/** Precio por hora × horas laborables totales (misma lógica que el backend). */
export function calcularCostoEstimado(
  precioPorHora: number,
  dias: number,
  horasPorDia: number,
): number | null {
  if (!precioPorHora || precioPorHora <= 0 || dias <= 0 || horasPorDia <= 0) {
    return null;
  }
  const horasTotales = Math.max(0.5, dias * horasPorDia);
  return Math.round(precioPorHora * horasTotales);
}

export function formatearPesosColombia(valor: number): string {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(valor);
}
