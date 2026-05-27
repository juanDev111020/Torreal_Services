package com.torreal.api.service.impl;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.exception.ApiBusinessException;

import com.torreal.api.dto.AdminAgendamientoDto;
import com.torreal.api.dto.AdminClienteDto;
import com.torreal.api.dto.AdminEmpleadoDto;
import com.torreal.api.dto.AdminPostulacionDto;
import com.torreal.api.dto.AdminRegistrarEmpleadoRequest;
import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.dto.RegistroOkResponseDto;
import com.torreal.api.service.AdminService;
import com.torreal.api.service.admin.AdminAgendamientoQueryService;
import com.torreal.api.service.admin.AdminCuentaService;
import com.torreal.api.service.admin.AdminNovedadAdminService;
import com.torreal.api.service.admin.AdminPostulacionQueryService;

/**
 * Fachada del panel de administración. Delega en servicios especializados por dominio.
 */
@Service
public class AdminServiceImpl implements AdminService {

  private final AdminAgendamientoQueryService agendamientoQueryService;
  private final AdminCuentaService cuentaService;
  private final AdminPostulacionQueryService postulacionQueryService;
  private final AdminNovedadAdminService novedadAdminService;

  public AdminServiceImpl(
      AdminAgendamientoQueryService agendamientoQueryService,
      AdminCuentaService cuentaService,
      AdminPostulacionQueryService postulacionQueryService,
      AdminNovedadAdminService novedadAdminService) {
    this.agendamientoQueryService = agendamientoQueryService;
    this.cuentaService = cuentaService;
    this.postulacionQueryService = postulacionQueryService;
    this.novedadAdminService = novedadAdminService;
  }

  @Override
  public List<AdminAgendamientoDto> listarAgendamientos() {
    return agendamientoQueryService.listarTodos();
  }

  @Override
  public List<AdminClienteDto> listarClientes() {
    return cuentaService.listarClientes();
  }

  @Override
  public void cambiarEstadoCliente(long clienteId, String estado) {
    cuentaService.cambiarEstadoCliente(clienteId, estado);
  }

  @Override
  public List<AdminEmpleadoDto> listarEmpleados() {
    return cuentaService.listarEmpleados();
  }

  @Override
  public void cambiarEstadoEmpleado(long empleadoId, String estado) {
    cuentaService.cambiarEstadoEmpleado(empleadoId, estado);
  }

  @Override
  public RegistroOkResponseDto registrarEmpleado(AdminRegistrarEmpleadoRequest body) {
    if (body == null) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Datos de empleado incompletos.");
    }
    cuentaService.registrarEmpleado(
        body.email(), body.password(), body.nombreCompleto(), body.telefono(), body.especialidad());
    return new RegistroOkResponseDto(true);
  }

  @Override
  public List<AdminPostulacionDto> listarPostulaciones() {
    return postulacionQueryService.listar();
  }

  @Override
  public Resource obtenerCvPostulacion(long postulacionId) {
    return postulacionQueryService.obtenerCv(postulacionId);
  }

  @Override
  public List<NovedadPublicaDto> listarNovedades() {
    return novedadAdminService.listar();
  }

  @Override
  public NovedadPublicaDto crearNovedad(String titulo, String contenido, MultipartFile imagen) {
    return novedadAdminService.crear(titulo, contenido, imagen);
  }

  @Override
  public void eliminarNovedad(long id) {
    novedadAdminService.eliminar(id);
  }
}
