package com.torreal.api.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.dto.ServicioPublicoDto;
import com.torreal.api.repository.ServicioRepository;
import com.torreal.api.service.ServicioPublicoService;

@Service
public class ServicioPublicoServiceImpl implements ServicioPublicoService {

  private final ServicioRepository servicioRepository;

  public ServicioPublicoServiceImpl(ServicioRepository servicioRepository) {
    this.servicioRepository = servicioRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<ServicioPublicoDto> listar() {
    return servicioRepository.findAllParaListadoPublico().stream()
        .map(ServicioPublicoServiceImpl::filaADto)
        .toList();
  }

  private static ServicioPublicoDto filaADto(Object[] row) {
    long id = row[0] instanceof Number n ? n.longValue() : Long.parseLong(String.valueOf(row[0]));
    String nombre = row[1] != null ? String.valueOf(row[1]) : "";
    String descripcion = row[2] != null ? String.valueOf(row[2]) : "";
    return new ServicioPublicoDto(id, nombre, descripcion);
  }
}
