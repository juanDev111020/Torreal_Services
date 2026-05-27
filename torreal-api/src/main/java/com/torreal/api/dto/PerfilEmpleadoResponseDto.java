package com.torreal.api.dto;

public record PerfilEmpleadoResponseDto(
    String nombreCompleto,
    String email,
    String telefono,
    String especialidad,
    String estadoLaboral,
    String estadoCuenta,
    boolean activo) {}
