package com.torreal.api.service.impl;

import org.springframework.stereotype.Service;

import com.torreal.api.dto.HealthResponseDto;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.service.HealthService;

@Service
public class HealthServiceImpl implements HealthService {

  private final UsuarioRepository usuarioRepository;

  public HealthServiceImpl(UsuarioRepository usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  @Override
  public HealthResponseDto health() {
    try {
      usuarioRepository.count();
      return new HealthResponseDto("ok", true);
    } catch (Exception e) {
      return new HealthResponseDto("error", false);
    }
  }
}
