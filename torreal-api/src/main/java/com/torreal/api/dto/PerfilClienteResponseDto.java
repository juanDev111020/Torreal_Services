package com.torreal.api.dto;

import java.util.List;

public record PerfilClienteResponseDto(
    String nombreCompleto,
    String email,
    String telefono,
    String direccion,
    String tipoCliente,
    String nitPh,
    String personaContacto,
    String estadoCuenta,
    boolean activo,
    List<AgendamientoClienteCardDto> agendamientos) {}
