package com.torreal.api.util;

import java.time.LocalTime;

public final class HorarioLaboralUtil {

  private static final LocalTime FIN_MANANA = LocalTime.of(12, 0);
  private static final LocalTime INICIO_TARDE = LocalTime.of(14, 0);

  private HorarioLaboralUtil() {}

  /**
   * Horas laborables en un día entre {@code horaInicio} y {@code horaFin}, sin contar
   * el almuerzo de 12:00 a 14:00.
   */
  public static double horasLaborablesPorDia(LocalTime horaInicio, LocalTime horaFin) {
    if (horaInicio == null || horaFin == null || !horaFin.isAfter(horaInicio)) {
      return 0;
    }

    long minutos = 0;

    if (horaInicio.isBefore(FIN_MANANA)) {
      LocalTime finManana = horaFin.isBefore(FIN_MANANA) ? horaFin : FIN_MANANA;
      if (finManana.isAfter(horaInicio)) {
        minutos += java.time.Duration.between(horaInicio, finManana).toMinutes();
      }
    }

    if (horaFin.isAfter(INICIO_TARDE)) {
      LocalTime inicioTarde = horaInicio.isAfter(INICIO_TARDE) ? horaInicio : INICIO_TARDE;
      if (horaFin.isAfter(inicioTarde)) {
        minutos += java.time.Duration.between(inicioTarde, horaFin).toMinutes();
      }
    }

    return Math.round((minutos / 60.0) * 10.0) / 10.0;
  }
}
