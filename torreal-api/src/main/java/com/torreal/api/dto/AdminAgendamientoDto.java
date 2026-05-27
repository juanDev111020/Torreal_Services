package com.torreal.api.dto;

import java.time.Instant;

public record AdminAgendamientoDto(
    long id,
    String clienteNombre,
    String empleadoNombre,
    String servicioNombre,
    Instant fechaInicio,
    Instant fechaFin,
    String estado) {}
