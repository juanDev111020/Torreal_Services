package com.torreal.api.dto;

public record TokenRegistroEmpleadoDto(
    String token, int segundosRestantes, int vigenciaSegundos) {}
