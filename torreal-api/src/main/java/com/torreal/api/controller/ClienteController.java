package com.torreal.api.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.torreal.api.dto.ErrorResponseDto;

import com.torreal.api.dto.AgendamientoCreadoResponseDto;
import com.torreal.api.dto.CrearAgendamientoRequest;
import java.util.List;

import com.torreal.api.dto.PerfilClienteResponseDto;
import com.torreal.api.dto.TarifaClienteDto;
import com.torreal.api.security.TorrealSecurity;
import com.torreal.api.service.ClienteAgendamientoService;
import com.torreal.api.service.ClientePerfilService;
import com.torreal.api.service.ClienteTarifaService;

@RestController
@RequestMapping("/api/cliente")
public class ClienteController {

  private final ClientePerfilService clientePerfilService;
  private final ClienteAgendamientoService clienteAgendamientoService;
  private final ClienteTarifaService clienteTarifaService;

  public ClienteController(
      ClientePerfilService clientePerfilService,
      ClienteAgendamientoService clienteAgendamientoService,
      ClienteTarifaService clienteTarifaService) {
    this.clientePerfilService = clientePerfilService;
    this.clienteAgendamientoService = clienteAgendamientoService;
    this.clienteTarifaService = clienteTarifaService;
  }

  @GetMapping("/mi-perfil")
  public PerfilClienteResponseDto miPerfil() {
    return clientePerfilService.miPerfil(TorrealSecurity.requireUsuario().getUserId());
  }

  /** Tarifas por hora del tipo de cliente autenticado (Natural / Propiedad Horizontal). */
  @GetMapping("/tarifas")
  public List<TarifaClienteDto> tarifas() {
    return clienteTarifaService.tarifasParaUsuario(TorrealSecurity.requireUsuario().getUserId());
  }

  @PostMapping("/agendamientos")
  public ResponseEntity<AgendamientoCreadoResponseDto> crear(@RequestBody CrearAgendamientoRequest body) {
    return ResponseEntity.status(HttpStatus.CREATED)
        .body(clienteAgendamientoService.crear(TorrealSecurity.requireUsuario().getUserId(), body));
  }

  @PostMapping("/agendamientos/{id}/cancelar")
  public ResponseEntity<ErrorResponseDto> cancelar(@PathVariable("id") long id) {
    clienteAgendamientoService.cancelar(TorrealSecurity.requireUsuario().getUserId(), id);
    return ResponseEntity.ok(new ErrorResponseDto("Reserva cancelada correctamente."));
  }
}
