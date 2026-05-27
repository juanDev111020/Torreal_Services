package com.torreal.api.util;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import org.springframework.http.HttpStatus;

import com.torreal.api.domain.TorrealZonaHoraria;
import com.torreal.api.exception.ApiBusinessException;

public final class AgendamientoFechasValidacion {

  private AgendamientoFechasValidacion() {}

  public static void validarRangoFuturo(Instant inicio, Instant fin) {
    Instant ahora = Instant.now();
    if (inicio.isBefore(ahora)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST,
          "No puedes reservar con fecha u hora de inicio anterior al momento actual.");
    }
    if (!fin.isAfter(inicio)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST,
          "La fecha y hora de fin deben ser posteriores al inicio.");
    }
  }

  public static void validarFechasTexto(
      String fechaInicio, String fechaFin, String horaInicio, String horaFin) {
    LocalDate hoy = LocalDate.now(TorrealZonaHoraria.BOGOTA);
    LocalDate dInicio = LocalDate.parse(fechaInicio.trim());
    LocalDate dFin = LocalDate.parse(fechaFin.trim());

    if (dInicio.isBefore(hoy)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "La fecha de inicio no puede ser anterior a hoy.");
    }
    if (dFin.isBefore(hoy)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "La fecha de fin no puede ser anterior a hoy.");
    }
    if (dFin.isBefore(dInicio)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "La fecha de fin no puede ser anterior a la de inicio.");
    }

    HorarioAgendamiento.validarHoraPermitida(horaInicio, "hora de inicio");
    HorarioAgendamiento.validarHoraPermitida(horaFin, "hora de fin");

    LocalTime tInicio = LocalTime.parse(horaInicio.trim());
    LocalTime tFin = LocalTime.parse(horaFin.trim());

    if (dFin.equals(dInicio) && !tFin.isAfter(tInicio)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "La hora de fin debe ser posterior a la hora de inicio.");
    }

    if (dInicio.equals(hoy)) {
      LocalTime ahora = LocalTime.now(TorrealZonaHoraria.BOGOTA);
      if (!tInicio.isAfter(ahora)) {
        throw new ApiBusinessException(
            HttpStatus.BAD_REQUEST,
            "La hora de inicio no puede ser anterior a la hora actual.");
      }
    }

    if (dFin.equals(hoy) && !tFin.isAfter(LocalTime.now(TorrealZonaHoraria.BOGOTA))) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "La hora de fin no puede ser anterior a la hora actual.");
    }
  }
}
