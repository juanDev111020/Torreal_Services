package com.torreal.api.service;

import com.torreal.api.dto.PerfilClienteResponseDto;

public interface ClientePerfilService {

  PerfilClienteResponseDto miPerfil(long usuarioId);
}
