package com.torreal.api.service;

import com.torreal.api.dto.AgendamientoCreadoResponseDto;
import com.torreal.api.dto.CrearAgendamientoRequest;

public interface ClienteAgendamientoService {

  AgendamientoCreadoResponseDto crear(long usuarioId, CrearAgendamientoRequest request);

  void cancelar(long usuarioId, long agendamientoId);
}
