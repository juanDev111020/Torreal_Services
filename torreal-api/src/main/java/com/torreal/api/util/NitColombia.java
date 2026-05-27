package com.torreal.api.util;

import java.util.regex.Pattern;

public final class NitColombia {

  private static final Pattern DIGITS = Pattern.compile("^\\d+$");
  private static final Pattern SINGLE_DV = Pattern.compile("^\\d$");

  private NitColombia() {}

  public record NitResult(boolean ok, String error, String nit) {}

  public static NitResult validarYNormalizarNitPh(String input) {
    String raw = input == null ? "" : input.trim();
    if (raw.isEmpty()) {
      return new NitResult(
          false, "El NIT / identificación de la propiedad horizontal es obligatorio.", null);
    }
    String[] partes = raw.split("\\s*-\\s*");
    if (partes.length != 2) {
      return new NitResult(
          false, "Indica el guion entre la base y el DV (ejemplo: 890.903.938 - 8).", null);
    }
    String baseDigitos = partes[0].replaceAll("[.\\s]", "");
    String dv = partes[1].replaceAll("\\s", "");
    if (!DIGITS.matcher(baseDigitos).matches()) {
      return new NitResult(
          false,
          "La base del NIT solo debe contener dígitos (puede usar puntos como separadores).",
          null);
    }
    if (baseDigitos.length() < 9 || baseDigitos.length() > 10) {
      return new NitResult(
          false,
          "La base del NIT debe tener entre 9 y 10 dígitos (sin contar el dígito de verificación).",
          null);
    }
    if (!SINGLE_DV.matcher(dv).matches()) {
      return new NitResult(
          false, "El dígito de verificación (DV) debe ser un solo número (0-9).", null);
    }
    return new NitResult(true, null, baseDigitos + "-" + dv);
  }
}
