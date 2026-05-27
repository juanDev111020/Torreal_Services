package com.torreal.api.service;

import com.torreal.api.entity.Cliente;

public interface ClienteAccesoService {

  /** Perfil en `clientes` vinculado al usuario; lo crea si el usuario es Cliente y aún no existe. */
  Cliente obtenerClienteParaUsuario(long usuarioId);
}
