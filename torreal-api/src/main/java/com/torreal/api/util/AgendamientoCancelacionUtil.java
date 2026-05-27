package com.torreal.api.util;

import java.time.Instant;
import java.time.temporal.ChronoUnit;

public final class AgendamientoCancelacionUtil {

  private static final long HORAS_ANTICIPACION = 24;

  private AgendamientoCancelacionUtil() {}

  public static boolean puedeCancelar(Instant inicioServicio, String estado) {
    if (inicioServicio == null || !esEstadoCancelable(estado)) {
      return false;
    }
    Instant limite = Instant.now().plus(HORAS_ANTICIPACION, ChronoUnit.HOURS);
    return inicioServicio.isAfter(limite);
  }

  public static boolean esEstadoCancelable(String estado) {
    if (estado == null || estado.isBlank()) {
      return false;
    }
    String e = estado.trim();
    return !"Cancelado".equalsIgnoreCase(e) && !"Finalizado".equalsIgnoreCase(e);
  }
}
