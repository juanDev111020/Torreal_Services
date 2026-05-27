package com.torreal.api.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import com.torreal.api.dto.ServicioPublicoDto;
import com.torreal.api.service.ServicioPublicoService;

@RestController
public class ServicioPublicoController {

  private final ServicioPublicoService servicioPublicoService;

  public ServicioPublicoController(ServicioPublicoService servicioPublicoService) {
    this.servicioPublicoService = servicioPublicoService;
  }

  @GetMapping("/api/servicios")
  public List<ServicioPublicoDto> listar() {
    return servicioPublicoService.listar();
  }
}
