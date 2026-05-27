package com.torreal.api.dto;

public record CrearAgendamientoRequest(
    long idServicio,
    String direccion,
    String nit,
    String fechaInicio,
    String fechaFin,
    String horaInicio,
    String horaFin,
    String nombreCliente) {}
