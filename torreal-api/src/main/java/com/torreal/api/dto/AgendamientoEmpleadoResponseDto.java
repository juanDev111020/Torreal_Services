package com.torreal.api.dto;

import java.time.Instant;

public record AgendamientoEmpleadoResponseDto(
    long id,
    Instant fechaProgramada,
    Instant fechaFinServicio,
    String estado,
    String servicioNombre,
    String clienteNombre) {}
