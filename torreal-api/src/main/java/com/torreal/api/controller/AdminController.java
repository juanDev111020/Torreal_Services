package com.torreal.api.controller;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.dto.AdminAgendamientoDto;
import com.torreal.api.dto.AdminClienteDto;
import com.torreal.api.dto.AdminEmpleadoDto;
import com.torreal.api.dto.AdminPostulacionDto;
import com.torreal.api.dto.AdminRegistrarEmpleadoRequest;
import com.torreal.api.dto.CambiarEstadoRequest;
import com.torreal.api.dto.RegistroOkResponseDto;
import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.dto.TokenRegistroEmpleadoDto;
import com.torreal.api.security.TorrealSecurity;
import com.torreal.api.service.AdminService;
import com.torreal.api.service.TokenRegistroEmpleadoService;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

  private final AdminService adminService;
  private final TokenRegistroEmpleadoService tokenRegistroEmpleadoService;

  public AdminController(
      AdminService adminService, TokenRegistroEmpleadoService tokenRegistroEmpleadoService) {
    this.adminService = adminService;
    this.tokenRegistroEmpleadoService = tokenRegistroEmpleadoService;
  }

  @GetMapping("/token-registro-empleado")
  public TokenRegistroEmpleadoDto tokenRegistroEmpleado() {
    TorrealSecurity.requireUsuario();
    return tokenRegistroEmpleadoService.obtenerTokenActual();
  }

  @GetMapping("/agendamientos")
  public List<AdminAgendamientoDto> agendamientos() {
    TorrealSecurity.requireUsuario();
    return adminService.listarAgendamientos();
  }

  @GetMapping("/clientes")
  public List<AdminClienteDto> clientes() {
    TorrealSecurity.requireUsuario();
    return adminService.listarClientes();
  }

  @PatchMapping("/clientes/{id}/estado")
  public ResponseEntity<Void> estadoCliente(
      @PathVariable long id, @RequestBody CambiarEstadoRequest body) {
    TorrealSecurity.requireUsuario();
    adminService.cambiarEstadoCliente(id, body != null ? body.estado() : null);
    return ResponseEntity.noContent().build();
  }

  @GetMapping("/empleados")
  public List<AdminEmpleadoDto> empleados() {
    TorrealSecurity.requireUsuario();
    return adminService.listarEmpleados();
  }

  @PatchMapping("/empleados/{id}/estado")
  public ResponseEntity<Void> estadoEmpleado(
      @PathVariable long id, @RequestBody CambiarEstadoRequest body) {
    TorrealSecurity.requireUsuario();
    adminService.cambiarEstadoEmpleado(id, body != null ? body.estado() : null);
    return ResponseEntity.noContent().build();
  }

  @PostMapping("/empleados/registrar")
  public ResponseEntity<RegistroOkResponseDto> registrarEmpleado(
      @RequestBody AdminRegistrarEmpleadoRequest body) {
    TorrealSecurity.requireUsuario();
    return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
        .body(adminService.registrarEmpleado(body));
  }

  @GetMapping("/postulaciones")
  public List<AdminPostulacionDto> postulaciones() {
    TorrealSecurity.requireUsuario();
    return adminService.listarPostulaciones();
  }

  @GetMapping("/postulaciones/{id}/cv")
  public ResponseEntity<Resource> cvPostulacion(@PathVariable long id) {
    TorrealSecurity.requireUsuario();
    Resource archivo = adminService.obtenerCvPostulacion(id);
    return ResponseEntity.ok()
        .contentType(MediaType.APPLICATION_PDF)
        .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"cv-" + id + ".pdf\"")
        .body(archivo);
  }

  @GetMapping("/novedades")
  public List<NovedadPublicaDto> novedades() {
    TorrealSecurity.requireUsuario();
    return adminService.listarNovedades();
  }

  @PostMapping(value = "/novedades", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public NovedadPublicaDto crearNovedad(
      @RequestParam("titulo") String titulo,
      @RequestParam("contenido") String contenido,
      @RequestParam("imagen") MultipartFile imagen) {
    TorrealSecurity.requireUsuario();
    return adminService.crearNovedad(titulo, contenido, imagen);
  }

  @DeleteMapping("/novedades/{id}")
  public ResponseEntity<Void> eliminarNovedad(@PathVariable long id) {
    TorrealSecurity.requireUsuario();
    adminService.eliminarNovedad(id);
    return ResponseEntity.noContent().build();
  }
}
