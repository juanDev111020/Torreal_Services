package com.torreal.api.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.entity.Cliente;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.ClienteRepository;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.service.ClienteAccesoService;

@Service
public class ClienteAccesoServiceImpl implements ClienteAccesoService {

  private static final String TIPO_NATURAL = "Natural";

  private final ClienteRepository clienteRepository;
  private final UsuarioRepository usuarioRepository;

  public ClienteAccesoServiceImpl(
      ClienteRepository clienteRepository, UsuarioRepository usuarioRepository) {
    this.clienteRepository = clienteRepository;
    this.usuarioRepository = usuarioRepository;
  }

  @Override
  @Transactional
  public Cliente obtenerClienteParaUsuario(long usuarioId) {
    return clienteRepository
        .findByUsuario_Id(usuarioId)
        .orElseGet(() -> crearClienteSiFalta(usuarioId));
  }

  private Cliente crearClienteSiFalta(long usuarioId) {
    Usuario u =
        usuarioRepository
            .findById(usuarioId)
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
    if (!RolUsuario.esCliente(u.getRol())) {
      throw new ApiBusinessException(HttpStatus.FORBIDDEN, "Acceso solo para clientes.");
    }
    Cliente c = new Cliente();
    c.setUsuario(u);
    c.setTipoCliente(TIPO_NATURAL);
    c.setEstado("activo");
    return clienteRepository.save(c);
  }
}
