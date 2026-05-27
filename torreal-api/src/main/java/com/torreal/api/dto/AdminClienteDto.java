package com.torreal.api.dto;

public record AdminClienteDto(
    long idCliente,
    long idUsuario,
    String nombreCompleto,
    String email,
    String telefono,
    String tipoCliente,
    String estado,
    boolean activo,
    long totalAgendamientos,
    long agendamientosActivos,
    boolean tieneAgendamientos) {}
