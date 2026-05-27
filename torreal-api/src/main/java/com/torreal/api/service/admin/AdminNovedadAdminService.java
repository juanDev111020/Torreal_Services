package com.torreal.api.service.admin;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.dto.NovedadPublicaDto;

public interface AdminNovedadAdminService {

  List<NovedadPublicaDto> listar();

  NovedadPublicaDto crear(String titulo, String contenido, MultipartFile imagen);

  void eliminar(long id);
}
