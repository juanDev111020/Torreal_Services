package com.torreal.api.util;

import java.time.LocalTime;
import java.util.Set;

import org.springframework.http.HttpStatus;

import com.torreal.api.exception.ApiBusinessException;

public final class HorarioAgendamiento {

  private static final Set<String> HORAS_PERMITIDAS =
      Set.of(
          "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00",
          "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30", "18:00");

  private static final String MENSAJE_HORARIO =
      "Solo se permiten horas de 8:00 a.m. a 12:00 p.m. o de 2:00 p.m. a 6:00 p.m., en punto o y media.";

  private HorarioAgendamiento() {}

  public static void validarHoraPermitida(String hora, String etiqueta) {
    if (hora == null || hora.isBlank()) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "Indica la " + etiqueta + ".");
    }
    String normalizada = hora.trim();
    if (!HORAS_PERMITIDAS.contains(normalizada)) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, MENSAJE_HORARIO);
    }
    LocalTime.parse(normalizada);
  }
}
