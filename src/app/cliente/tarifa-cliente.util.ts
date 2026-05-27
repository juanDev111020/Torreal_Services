import { TarifaCliente } from '../core/cliente-api.service';

/** Lee id y precio/hora desde la respuesta JSON de la API. */
export function tarifaClienteAMapa(lista: TarifaCliente[]): Record<number, number> {
  const mapa: Record<number, number> = {};
  for (const t of lista) {
    const id = Number(t.idServicio ?? t.id_servicio);
    const precio = Number(t.precioPorHora ?? t.precio_por_hora);
    if (Number.isFinite(id) && id > 0 && Number.isFinite(precio) && precio > 0) {
      mapa[id] = precio;
    }
  }
  return mapa;
}

export function esClientePropiedadHorizontal(tipoCliente: string | null | undefined): boolean {
  const t = (tipoCliente ?? '').trim().toLowerCase();
  return t.includes('propiedad') || t.includes('horizontal') || t === 'ph';
}
