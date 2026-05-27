package com.torreal.api.util;

import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;

import com.torreal.api.entity.Cliente;
import com.torreal.api.exception.ApiBusinessException;

/** Normalización y validación de estado de cuenta (activo / inactivo). */
public final class EstadoCuentaUtil {

  private static final List<String> VALORES_PERMITIDOS = List.of("activo", "inactivo");

  private EstadoCuentaUtil() {}

  /** Estado de fila `clientes.estado`; vacío → activo. */
  public static String normalizarCliente(String estado) {
    if (estado == null || estado.isBlank()) {
      return "activo";
    }
    return estado.trim().toLowerCase(Locale.ROOT);
  }

  /**
   * Estado de `usuarios.estado_laboral`; vacío o "en servicio" → activo (misma regla que el panel admin).
   */
  public static String normalizarEmpleado(String estado) {
    if (estado == null || estado.isBlank()) {
      return "activo";
    }
    String e = estado.trim().toLowerCase(Locale.ROOT);
    if ("en servicio".equals(e)) {
      return "activo";
    }
    return e;
  }

  public static boolean esActivo(String estadoNormalizado) {
    return "activo".equals(estadoNormalizado);
  }

  public static boolean esClienteActivo(Cliente cliente) {
    if (cliente == null) {
      return false;
    }
    return esActivo(normalizarCliente(cliente.getEstado()));
  }

  /** Valida entrada del admin (PATCH estado); lanza si no es activo ni inactivo. */
  public static String validarActivoInactivo(String estado) {
    String e = estado != null ? estado.trim().toLowerCase(Locale.ROOT) : "";
    if (!VALORES_PERMITIDOS.contains(e)) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Estado debe ser activo o inactivo.");
    }
    return e;
  }
}
