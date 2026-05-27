package com.torreal.api.service.impl.admin;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Locale;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.config.TorrealUploadsProperties;
import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.entity.Novedad;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.mapper.NovedadMapper;
import com.torreal.api.repository.NovedadRepository;
import com.torreal.api.service.admin.AdminNovedadAdminService;
import com.torreal.api.util.UploadsPathUtil;

import jakarta.annotation.PostConstruct;

@Service
public class AdminNovedadAdminServiceImpl implements AdminNovedadAdminService {

  private static final long MAX_IMAGE_BYTES = 5L * 1024 * 1024;
  private static final String CARPETA_NOVEDADES = "novedades";

  private final NovedadRepository novedadRepository;
  private final TorrealUploadsProperties uploadsProperties;

  public AdminNovedadAdminServiceImpl(
      NovedadRepository novedadRepository, TorrealUploadsProperties uploadsProperties) {
    this.novedadRepository = novedadRepository;
    this.uploadsProperties = uploadsProperties;
  }

  @PostConstruct
  public void initDirs() throws IOException {
    UploadsPathUtil.subdirectorio(uploadsProperties, CARPETA_NOVEDADES);
  }

  @Override
  @Transactional(readOnly = true)
  public List<NovedadPublicaDto> listar() {
    return novedadRepository.findAllByOrderByFechaPublicacionDesc().stream()
        .map(NovedadMapper::toDto)
        .toList();
  }

  @Override
  @Transactional
  public NovedadPublicaDto crear(String titulo, String contenido, MultipartFile imagen) {
    String tituloLimpio = titulo != null ? titulo.trim() : "";
    String contenidoLimpio = contenido != null ? contenido.trim() : "";
    if (tituloLimpio.isEmpty() || contenidoLimpio.isEmpty()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Indica título y descripción.");
    }
    if (imagen == null || imagen.isEmpty()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Indica una imagen para la novedad.");
    }

    Novedad novedad = new Novedad();
    novedad.setTitulo(tituloLimpio);
    novedad.setContenido(contenidoLimpio);
    novedad.setImagenUrl(guardarImagen(imagen));
    novedad.setTipo("Noticia");
    return NovedadMapper.toDto(novedadRepository.save(novedad));
  }

  @Override
  @Transactional
  public void eliminar(long id) {
    if (!novedadRepository.existsById(id)) {
      throw new ApiBusinessException(HttpStatus.NOT_FOUND, "Novedad no encontrada.");
    }
    novedadRepository.deleteById(id);
  }

  private String guardarImagen(MultipartFile imagen) {
    String contentType = imagen.getContentType() != null ? imagen.getContentType() : "";
    if (!contentType.startsWith("image/")) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "Solo se permiten imágenes (JPG, PNG, WEBP).");
    }
    if (imagen.getSize() > MAX_IMAGE_BYTES) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "La imagen supera 5 MB.");
    }
    String extension = extensionDesdeContentType(contentType);
    String nombreArchivo = System.currentTimeMillis() + "-novedad" + extension;
    try {
      Path directorio = UploadsPathUtil.subdirectorio(uploadsProperties, CARPETA_NOVEDADES);
      Path destino = directorio.resolve(nombreArchivo);
      try (InputStream entrada = imagen.getInputStream()) {
        Files.copy(entrada, destino, StandardCopyOption.REPLACE_EXISTING);
      }
      return UploadsPathUtil.urlPublica(CARPETA_NOVEDADES, nombreArchivo);
    } catch (IOException e) {
      throw new ApiBusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la imagen.");
    }
  }

  private static String extensionDesdeContentType(String contentType) {
    return switch (contentType.toLowerCase(Locale.ROOT)) {
      case "image/png" -> ".png";
      case "image/webp" -> ".webp";
      case "image/gif" -> ".gif";
      default -> ".jpg";
    };
  }
}
