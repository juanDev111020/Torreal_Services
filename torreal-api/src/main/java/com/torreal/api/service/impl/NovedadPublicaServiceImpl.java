package com.torreal.api.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.mapper.NovedadMapper;
import com.torreal.api.repository.NovedadRepository;
import com.torreal.api.service.NovedadPublicaService;

@Service
@Transactional(readOnly = true)
public class NovedadPublicaServiceImpl implements NovedadPublicaService {

  private final NovedadRepository novedadRepository;

  public NovedadPublicaServiceImpl(NovedadRepository novedadRepository) {
    this.novedadRepository = novedadRepository;
  }

  @Override
  public List<NovedadPublicaDto> listarPublicas() {
    return novedadRepository.findAllByOrderByFechaPublicacionDesc().stream()
        .map(NovedadMapper::toDto)
        .toList();
  }
}
