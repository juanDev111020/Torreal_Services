package com.torreal.api.service.impl;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.config.TorrealUploadsProperties;
import com.torreal.api.util.UploadsPathUtil;
import com.torreal.api.dto.PostulacionCreatedResponseDto;
import com.torreal.api.entity.Postulacion;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.PostulacionRepository;
import com.torreal.api.service.PostulacionService;

import jakarta.annotation.PostConstruct;

@Service
public class PostulacionServiceImpl implements PostulacionService {

  private static final long MAX_BYTES = 5L * 1024 * 1024;

  private final PostulacionRepository postulacionRepository;
  private final TorrealUploadsProperties uploadsProperties;

  public PostulacionServiceImpl(
      PostulacionRepository postulacionRepository, TorrealUploadsProperties uploadsProperties) {
    this.postulacionRepository = postulacionRepository;
    this.uploadsProperties = uploadsProperties;
  }

  private static final String CARPETA_CV = "cv";

  @PostConstruct
  public void initDirs() throws IOException {
    UploadsPathUtil.subdirectorio(uploadsProperties, CARPETA_CV);
  }

  @Override
  @Transactional
  public PostulacionCreatedResponseDto crear(
      String nombreCompleto, String correoElectronico, MultipartFile cv) {
    String nombre = nombreCompleto != null ? nombreCompleto.trim() : "";
    String correo = correoElectronico != null ? correoElectronico.trim() : "";
    if (nombre.isEmpty() || correo.isEmpty()) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "Indica nombre completo y correo electrónico.");
    }

    String archivoCvUrl = null;
    Path savedAbs = null;
    try {
      if (cv != null && !cv.isEmpty()) {
        String contentType = cv.getContentType() != null ? cv.getContentType() : "";
        if (!"application/pdf".equalsIgnoreCase(contentType)) {
          throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Solo se permiten archivos PDF.");
        }
        if (cv.getSize() > MAX_BYTES) {
          throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "El PDF supera el tamaño máximo (5 MB).");
        }
        String filename = System.currentTimeMillis() + "-" + safePdfBasename(cv.getOriginalFilename());
        Path cvDir = UploadsPathUtil.subdirectorio(uploadsProperties, CARPETA_CV);
        savedAbs = cvDir.resolve(filename);
        try (InputStream in = cv.getInputStream()) {
          Files.copy(in, savedAbs, StandardCopyOption.REPLACE_EXISTING);
        }
        archivoCvUrl = UploadsPathUtil.urlPublica(CARPETA_CV, filename);
        if (archivoCvUrl.length() > 255) {
          archivoCvUrl = archivoCvUrl.substring(0, 255);
        }
      }

      Postulacion p = new Postulacion();
      p.setNombreCompleto(nombre);
      p.setCorreo(correo);
      p.setArchivoCvUrl(archivoCvUrl);
      Postulacion saved = postulacionRepository.save(p);
      return new PostulacionCreatedResponseDto(saved.getId());
    } catch (ApiBusinessException e) {
      deleteIfExists(savedAbs);
      throw e;
    } catch (IOException e) {
      deleteIfExists(savedAbs);
      throw new ApiBusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudo guardar la postulación.");
    }
  }

  private static void deleteIfExists(Path path) {
    if (path == null) {
      return;
    }
    try {
      Files.deleteIfExists(path);
    } catch (IOException ignored) {
    }
  }

  private static String safePdfBasename(String originalname) {
    String base = Path.of(originalname != null ? originalname : "cv.pdf").getFileName().toString();
    String cleaned = base.replaceAll("[^a-zA-Z0-9._-]", "_");
    if (cleaned.length() > 120) {
      cleaned = cleaned.substring(0, 120);
    }
    String lower = cleaned.toLowerCase();
    String withPdf = lower.endsWith(".pdf") ? cleaned : cleaned + ".pdf";
    return withPdf.length() > 160 ? withPdf.substring(0, 150) + ".pdf" : withPdf;
  }
}
