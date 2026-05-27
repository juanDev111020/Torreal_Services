package com.torreal.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.service.NovedadPublicaService;

@RestController
@RequestMapping("/api/novedades")
public class NovedadPublicoController {

  private final NovedadPublicaService novedadPublicaService;

  public NovedadPublicoController(NovedadPublicaService novedadPublicaService) {
    this.novedadPublicaService = novedadPublicaService;
  }

  @GetMapping
  public List<NovedadPublicaDto> listar() {
    return novedadPublicaService.listarPublicas();
  }
}
