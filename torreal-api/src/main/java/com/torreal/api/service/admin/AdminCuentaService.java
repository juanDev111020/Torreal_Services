package com.torreal.api.service.admin;

import java.util.List;

import com.torreal.api.dto.AdminClienteDto;
import com.torreal.api.dto.AdminEmpleadoDto;

/** Gestión de clientes y empleados desde el panel de administración. */
public interface AdminCuentaService {

  List<AdminClienteDto> listarClientes();

  void cambiarEstadoCliente(long clienteId, String estado);

  List<AdminEmpleadoDto> listarEmpleados();

  void cambiarEstadoEmpleado(long empleadoId, String estado);

  void registrarEmpleado(
      String email, String password, String nombreCompleto, String telefono, String especialidad);
}
