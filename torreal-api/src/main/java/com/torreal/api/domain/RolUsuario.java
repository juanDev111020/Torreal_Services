package com.torreal.api.domain;

/** Roles reconocidos por la API y el filtro JWT. */
public final class RolUsuario {

  public static final String EMPLEADO = "Empleado";
  public static final String CLIENTE = "Cliente";
  public static final String SUPER_USUARIO = "SuperUsuario";

  private RolUsuario() {}

  public static boolean esEmpleado(String rol) {
    return EMPLEADO.equalsIgnoreCase(rol != null ? rol.trim() : "");
  }

  public static boolean esCliente(String rol) {
    return CLIENTE.equalsIgnoreCase(rol != null ? rol.trim() : "");
  }
}
