package com.torreal.api.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.torreal.api.dto.AgendamientoEmpleadoResponseDto;
import com.torreal.api.dto.PerfilEmpleadoResponseDto;
import com.torreal.api.security.TorrealSecurity;
import com.torreal.api.service.EmpleadoAgendaService;
import com.torreal.api.service.EmpleadoPerfilService;

@RestController
@RequestMapping("/api/empleado")
public class EmpleadoController {

  private final EmpleadoPerfilService empleadoPerfilService;
  private final EmpleadoAgendaService empleadoAgendaService;

  public EmpleadoController(
      EmpleadoPerfilService empleadoPerfilService, EmpleadoAgendaService empleadoAgendaService) {
    this.empleadoPerfilService = empleadoPerfilService;
    this.empleadoAgendaService = empleadoAgendaService;
  }

  @GetMapping("/mi-perfil")
  public PerfilEmpleadoResponseDto miPerfil() {
    return empleadoPerfilService.miPerfil(TorrealSecurity.requireUsuario().getUserId());
  }

  @GetMapping("/mis-agendamientos")
  public List<AgendamientoEmpleadoResponseDto> misAgendamientos(
      @RequestParam(name = "year", required = false) Integer year) {
    int y = year == null || year < 2000 || year > 2100 ? LocalDate.now().getYear() : year;
    return empleadoAgendaService.misAgendamientos(TorrealSecurity.requireUsuario().getUserId(), y);
  }
}
