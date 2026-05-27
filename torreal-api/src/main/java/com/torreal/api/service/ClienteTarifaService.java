package com.torreal.api.service;

import java.util.List;

import com.torreal.api.dto.TarifaClienteDto;

public interface ClienteTarifaService {

  List<TarifaClienteDto> tarifasParaUsuario(long usuarioId);
}
