package com.torreal.api.service;

import com.torreal.api.dto.TokenRegistroEmpleadoDto;

public interface TokenRegistroEmpleadoService {

  TokenRegistroEmpleadoDto obtenerTokenActual();

  void validarParaRegistroEmpleado(String tokenIngresado);
}
