package com.torreal.api.dto;

public record AdminRegistrarEmpleadoRequest(
    String email,
    String password,
    String nombreCompleto,
    String telefono,
    String especialidad) {}
