package com.torreal.api.util;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.temporal.ChronoUnit;

import com.torreal.api.domain.TorrealZonaHoraria;
import com.torreal.api.entity.Tarifa;

public final class AgendamientoPrecioUtil {

  private AgendamientoPrecioUtil() {}

  /** Total según tarifa, días de servicio y horario diario (sin contar 12:00–14:00). */
  public static BigDecimal calcularTotalPorJornadas(
      Tarifa tarifa, Instant inicio, Instant fin) {
    if (tarifa == null || tarifa.getPrecio() == null || inicio == null || fin == null) {
      return BigDecimal.ZERO;
    }

    LocalDate d0 = inicio.atZone(TorrealZonaHoraria.BOGOTA).toLocalDate();
    LocalDate d1 = fin.atZone(TorrealZonaHoraria.BOGOTA).toLocalDate();
    long dias = ChronoUnit.DAYS.between(d0, d1) + 1;
    if (dias < 1) {
      dias = 1;
    }

    LocalTime tInicio = inicio.atZone(TorrealZonaHoraria.BOGOTA).toLocalTime();
    LocalTime tFin = fin.atZone(TorrealZonaHoraria.BOGOTA).toLocalTime();
    double horasPorDia = HorarioLaboralUtil.horasLaborablesPorDia(tInicio, tFin);

    BigDecimal precio = tarifa.getPrecio();
    double horasTotales = Math.max(0.5, horasPorDia * dias);
    return precio.multiply(BigDecimal.valueOf(horasTotales)).setScale(2, RoundingMode.HALF_UP);
  }

  /** @deprecated Usar {@link #calcularTotalPorJornadas} para reservas con jornada diaria. */
  public static BigDecimal calcularTotal(Tarifa tarifa, Instant inicio, Instant fin) {
    return calcularTotalPorJornadas(tarifa, inicio, fin);
  }
}
