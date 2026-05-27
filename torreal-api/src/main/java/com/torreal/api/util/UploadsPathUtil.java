package com.torreal.api.util;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import com.torreal.api.config.TorrealUploadsProperties;

/** Rutas del directorio de archivos subidos (CV, novedades, etc.). */
public final class UploadsPathUtil {

  private UploadsPathUtil() {}

  public static Path raiz(TorrealUploadsProperties properties) {
    return Path.of(properties.getDir()).toAbsolutePath().normalize();
  }

  public static Path subdirectorio(TorrealUploadsProperties properties, String nombreCarpeta)
      throws IOException {
    Path dir = raiz(properties).resolve(nombreCarpeta);
    Files.createDirectories(dir);
    return dir;
  }

  public static String urlPublica(String carpeta, String nombreArchivo) {
    return "uploads/" + carpeta + "/" + nombreArchivo;
  }

  /** Convierte la ruta guardada en BD (p. ej. uploads/cv/123.pdf) al archivo en disco. */
  public static Path resolverArchivo(TorrealUploadsProperties properties, String urlGuardada) {
    if (urlGuardada == null || urlGuardada.isBlank()) {
      return null;
    }
    String rel = urlGuardada.trim().replace('\\', '/');
    if (rel.startsWith("/")) {
      rel = rel.substring(1);
    }
    String prefix = properties.getPublicPrefix();
    if (prefix.startsWith("/")) {
      prefix = prefix.substring(1);
    }
    if (!prefix.endsWith("/")) {
      prefix = prefix + "/";
    }
    if (rel.startsWith(prefix)) {
      rel = rel.substring(prefix.length());
    } else if (rel.startsWith("uploads/")) {
      rel = rel.substring("uploads/".length());
    }
    Path root = raiz(properties);
    Path resolved = root.resolve(rel).normalize();
    if (!resolved.startsWith(root)) {
      return null;
    }
    return resolved;
  }

  public static boolean existeEnDisco(TorrealUploadsProperties properties, String urlGuardada) {
    Path path = resolverArchivo(properties, urlGuardada);
    return path != null && Files.isRegularFile(path);
  }
}
