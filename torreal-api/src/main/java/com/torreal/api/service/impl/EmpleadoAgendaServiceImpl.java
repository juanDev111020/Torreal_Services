package com.torreal.api.service.impl;

import java.util.List;

import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.dto.AgendamientoEmpleadoResponseDto;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.mapper.AgendamientoMapper;
import com.torreal.api.repository.AgendamientoRepository;
import com.torreal.api.service.EmpleadoAgendaService;

@Service
public class EmpleadoAgendaServiceImpl implements EmpleadoAgendaService {

  private final AgendamientoRepository agendamientoRepository;

  public EmpleadoAgendaServiceImpl(AgendamientoRepository agendamientoRepository) {
    this.agendamientoRepository = agendamientoRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<AgendamientoEmpleadoResponseDto> misAgendamientos(long empleadoId, int year) {
    try {
      return agendamientoRepository.findAgendamientosEmpleadoPorAnio(empleadoId, year).stream()
          .map(AgendamientoMapper::fromNativeRow)
          .toList();
    } catch (InvalidDataAccessResourceUsageException e) {
      String msg = e.getMostSpecificCause() != null ? e.getMostSpecificCause().getMessage() : "";
      if (msg.contains("fecha_inicio")
          || msg.contains("fecha_fin")
          || msg.contains("fecha_programada")
          || msg.contains("fecha_fin_servicio")
          || msg.contains("Unknown column")) {
        throw new ApiBusinessException(
            HttpStatus.INTERNAL_SERVER_ERROR, "No se pudieron cargar los agendamientos.");
      }
      throw new ApiBusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudieron cargar los agendamientos.");
    } catch (Exception e) {
      throw new ApiBusinessException(HttpStatus.INTERNAL_SERVER_ERROR, "No se pudieron cargar los agendamientos.");
    }
  }
}
