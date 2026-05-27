package com.torreal.api.domain;

import java.time.ZoneId;

/** Zona horaria de negocio para fechas mostradas al usuario. */
public final class TorrealZonaHoraria {

  public static final ZoneId BOGOTA = ZoneId.of("America/Bogota");

  private TorrealZonaHoraria() {}
}
