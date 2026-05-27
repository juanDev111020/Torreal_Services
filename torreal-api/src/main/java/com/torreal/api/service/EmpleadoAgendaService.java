package com.torreal.api.service;

import java.util.List;

import com.torreal.api.dto.AgendamientoEmpleadoResponseDto;

public interface EmpleadoAgendaService {

  List<AgendamientoEmpleadoResponseDto> misAgendamientos(long empleadoId, int year);
}
