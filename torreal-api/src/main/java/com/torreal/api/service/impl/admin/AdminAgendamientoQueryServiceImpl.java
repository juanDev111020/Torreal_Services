package com.torreal.api.service.impl.admin;

import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.dto.AdminAgendamientoDto;
import com.torreal.api.mapper.AdminAgendamientoMapper;
import com.torreal.api.repository.AgendamientoRepository;
import com.torreal.api.service.admin.AdminAgendamientoQueryService;

@Service
@Transactional(readOnly = true)
public class AdminAgendamientoQueryServiceImpl implements AdminAgendamientoQueryService {

  private final AgendamientoRepository agendamientoRepository;

  public AdminAgendamientoQueryServiceImpl(AgendamientoRepository agendamientoRepository) {
    this.agendamientoRepository = agendamientoRepository;
  }

  @Override
  public List<AdminAgendamientoDto> listarTodos() {
    List<AdminAgendamientoDto> resultado = new ArrayList<>();
    for (Object[] fila : agendamientoRepository.findTodosParaAdmin()) {
      resultado.add(AdminAgendamientoMapper.fromNativeRow(fila));
    }
    return resultado;
  }
}
