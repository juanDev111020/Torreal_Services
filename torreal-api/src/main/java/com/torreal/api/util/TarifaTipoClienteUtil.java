package com.torreal.api.util;

public final class TarifaTipoClienteUtil {

  public static final String NATURAL = "Natural";
  public static final String PROPIEDAD_HORIZONTAL = "Propiedad Horizontal";

  private TarifaTipoClienteUtil() {}

  /** Convierte el valor guardado en `clientes.tipo_cliente` al texto del ENUM en `tarifas`. */
  public static String normalizarParaTarifa(String tipoCliente) {
    if (tipoCliente == null || tipoCliente.isBlank()) {
      return NATURAL;
    }
    String t = tipoCliente.trim().toLowerCase();
    if (t.contains("propiedad") || t.contains("horizontal") || t.equals("ph")) {
      return PROPIEDAD_HORIZONTAL;
    }
    return NATURAL;
  }
}
