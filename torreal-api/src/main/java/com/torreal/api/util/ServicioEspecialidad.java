package com.torreal.api.util;

import java.util.Locale;

public final class ServicioEspecialidad {

  private ServicioEspecialidad() {}

  /**
   * Relaciona el nombre del servicio con la especialidad del empleado que debe atenderlo.
   */
  public static String especialidadRequerida(String nombreServicio) {
    if (nombreServicio == null || nombreServicio.isBlank()) {
      return null;
    }
    String n = nombreServicio.toLowerCase(Locale.ROOT);
    if (n.contains("salva")) {
      return "Salvavidas";
    }
    if (n.contains("jardin")) {
      return "Jardinería";
    }
    if (n.contains("aseo")) {
      return "Aseo general";
    }
    if (n.contains("limpieza")) {
      return "Limpieza";
    }
    if (n.contains("manten")) {
      return "Mantenimiento";
    }
    if (n.contains("cctv")) {
      return "Instalación de CCTV";
    }
    if (n.contains("conserj")) {
      return "Conserjería";
    }
    if (n.contains("todero")) {
      return "Todero";
    }
    return nombreServicio.trim();
  }
}
