package com.torreal.api.service;

/** Alta de cuentas con rol Empleado (solo desde panel super usuario). */
public interface EmpleadoRegistroService {

  void registrarEmpleado(
      String email, String password, String nombreCompleto, String telefono, String especialidad);
}
