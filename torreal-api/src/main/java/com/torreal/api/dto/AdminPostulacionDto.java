package com.torreal.api.dto;

import java.time.Instant;

public record AdminPostulacionDto(
    long id,
    String nombreCompleto,
    String correo,
    String archivoCvUrl,
    Instant fechaEnvio,
    boolean cvDisponible) {}
