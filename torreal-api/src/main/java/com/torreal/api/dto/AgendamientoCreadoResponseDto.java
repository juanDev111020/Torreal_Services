package com.torreal.api.dto;

public record AgendamientoCreadoResponseDto(
    long id,
    String mensaje,
    String empleadoAsignado,
    String estado) {}
