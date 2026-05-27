package com.torreal.api.service;

import java.util.List;

import org.springframework.core.io.Resource;
import org.springframework.web.multipart.MultipartFile;

import com.torreal.api.dto.AdminAgendamientoDto;
import com.torreal.api.dto.AdminClienteDto;
import com.torreal.api.dto.AdminEmpleadoDto;
import com.torreal.api.dto.AdminPostulacionDto;
import com.torreal.api.dto.AdminRegistrarEmpleadoRequest;
import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.dto.RegistroOkResponseDto;

public interface AdminService {

  List<AdminAgendamientoDto> listarAgendamientos();

  List<AdminClienteDto> listarClientes();

  void cambiarEstadoCliente(long clienteId, String estado);

  List<AdminEmpleadoDto> listarEmpleados();

  void cambiarEstadoEmpleado(long empleadoId, String estado);

  RegistroOkResponseDto registrarEmpleado(AdminRegistrarEmpleadoRequest body);

  List<AdminPostulacionDto> listarPostulaciones();

  Resource obtenerCvPostulacion(long postulacionId);

  List<NovedadPublicaDto> listarNovedades();

  NovedadPublicaDto crearNovedad(String titulo, String contenido, MultipartFile imagen);

  void eliminarNovedad(long id);
}
