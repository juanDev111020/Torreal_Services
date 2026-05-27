package com.torreal.api.dto;

import java.math.BigDecimal;

public record AgendamientoClienteCardDto(
    long id,
    String servicioNombre,
    String fechaInicio,
    String fechaFin,
    String horarioDiario,
    String estado,
    String empleadoNombre,
    String tipoCobro,
    BigDecimal precioPorHora,
    BigDecimal totalEstimado,
    boolean puedeCancelar) {}
