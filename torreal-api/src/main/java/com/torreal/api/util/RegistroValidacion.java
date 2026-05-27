package com.torreal.api.util;

import java.util.List;
import java.util.Set;

public final class RegistroValidacion {

  /** Debe coincidir con src/app/core/especialidad-empleado-opciones.ts */
  private static final Set<String> ESPECIALIDADES =
      Set.of(
          "Jardinería",
          "Aseo general",
          "Limpieza",
          "Mantenimiento",
          "Salvavidas",
          "Todero",
          "Instalación de CCTV",
          "Conserjería");

  private RegistroValidacion() {}

  public static boolean esEspecialidadValida(String val) {
    return val != null && ESPECIALIDADES.contains(val.trim());
  }

  public static List<String> especialidadesOrdenadas() {
    return ESPECIALIDADES.stream().sorted().toList();
  }

  public static String validarPasswordRegistro(String password) {
    if (password == null) {
      return "Contraseña no válida.";
    }
    if (password.length() < 8 || password.length() > 16) {
      return "La contraseña debe tener entre 8 y 16 caracteres.";
    }
    if (!password.chars().anyMatch(Character::isUpperCase)) {
      return "La contraseña debe incluir al menos una letra mayúscula (A-Z).";
    }
    return null;
  }

  public static String validarTelefonoCo(String telefono) {
    if (telefono == null || !telefono.matches("^\\d{10}$")) {
      return "El teléfono debe tener exactamente 10 dígitos numéricos.";
    }
    return null;
  }
}
