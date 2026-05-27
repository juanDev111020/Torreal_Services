package com.torreal.api.service.impl.admin;

import java.util.List;

import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.config.TorrealUploadsProperties;
import com.torreal.api.dto.AdminPostulacionDto;
import com.torreal.api.entity.Postulacion;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.PostulacionRepository;
import com.torreal.api.service.admin.AdminPostulacionQueryService;
import com.torreal.api.util.NativeRowMapper;
import com.torreal.api.util.UploadsPathUtil;

import java.nio.file.Path;

@Service
@Transactional(readOnly = true)
public class AdminPostulacionQueryServiceImpl implements AdminPostulacionQueryService {

  private final PostulacionRepository postulacionRepository;
  private final TorrealUploadsProperties uploadsProperties;

  public AdminPostulacionQueryServiceImpl(
      PostulacionRepository postulacionRepository, TorrealUploadsProperties uploadsProperties) {
    this.postulacionRepository = postulacionRepository;
    this.uploadsProperties = uploadsProperties;
  }

  @Override
  public List<AdminPostulacionDto> listar() {
    return postulacionRepository.findAllByOrderByFechaEnvioDesc().stream()
        .map(this::toDto)
        .toList();
  }

  @Override
  public Resource obtenerCv(long postulacionId) {
    Postulacion postulacion =
        postulacionRepository
            .findById(postulacionId)
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.NOT_FOUND, "Postulación no encontrada."));
    Path archivo = UploadsPathUtil.resolverArchivo(uploadsProperties, postulacion.getArchivoCvUrl());
    if (archivo == null || !java.nio.file.Files.isRegularFile(archivo)) {
      throw new ApiBusinessException(
          HttpStatus.NOT_FOUND,
          "El archivo PDF no está en el servidor. La postulación puede ser antigua o de prueba.");
    }
    return new FileSystemResource(archivo);
  }

  private AdminPostulacionDto toDto(Postulacion postulacion) {
    String cvUrl = NativeRowMapper.str(postulacion.getArchivoCvUrl());
    boolean cvDisponible = UploadsPathUtil.existeEnDisco(uploadsProperties, cvUrl);
    return new AdminPostulacionDto(
        postulacion.getId(),
        NativeRowMapper.str(postulacion.getNombreCompleto()),
        NativeRowMapper.str(postulacion.getCorreo()),
        cvUrl,
        postulacion.getFechaEnvio(),
        cvDisponible);
  }
}
