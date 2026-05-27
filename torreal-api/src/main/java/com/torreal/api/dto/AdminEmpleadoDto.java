package com.torreal.api.dto;

public record AdminEmpleadoDto(
    long id,
    String nombreCompleto,
    String email,
    String telefono,
    String especialidad,
    String estadoLaboral,
    boolean activo,
    boolean ocupado,
    long totalAgendamientos,
    long agendamientosActivos) {}
