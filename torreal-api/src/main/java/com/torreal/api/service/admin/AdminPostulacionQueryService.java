package com.torreal.api.service.admin;

import java.util.List;

import org.springframework.core.io.Resource;

import com.torreal.api.dto.AdminPostulacionDto;

public interface AdminPostulacionQueryService {

  List<AdminPostulacionDto> listar();

  Resource obtenerCv(long postulacionId);
}
