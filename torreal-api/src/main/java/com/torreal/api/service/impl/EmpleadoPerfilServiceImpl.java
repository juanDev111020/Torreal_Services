package com.torreal.api.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.dto.PerfilEmpleadoResponseDto;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.service.EmpleadoPerfilService;
import com.torreal.api.util.EstadoCuentaUtil;
import com.torreal.api.util.NativeRowMapper;

@Service
public class EmpleadoPerfilServiceImpl implements EmpleadoPerfilService {

  private final UsuarioRepository usuarioRepository;

  public EmpleadoPerfilServiceImpl(UsuarioRepository usuarioRepository) {
    this.usuarioRepository = usuarioRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public PerfilEmpleadoResponseDto miPerfil(long empleadoId) {
    Usuario usuario =
        usuarioRepository
            .findById(empleadoId)
            .orElseThrow(() -> new ApiBusinessException(HttpStatus.NOT_FOUND, "Usuario no encontrado."));
    if (!RolUsuario.esEmpleado(usuario.getRol())) {
      throw new ApiBusinessException(HttpStatus.NOT_FOUND, "Usuario no encontrado.");
    }
    String estadoCuenta = EstadoCuentaUtil.normalizarEmpleado(usuario.getEstadoLaboral());
    return new PerfilEmpleadoResponseDto(
        NativeRowMapper.str(usuario.getNombreCompleto()),
        NativeRowMapper.str(usuario.getEmail()),
        NativeRowMapper.str(usuario.getTelefono()),
        NativeRowMapper.str(usuario.getEspecialidad()),
        NativeRowMapper.str(usuario.getEstadoLaboral()),
        estadoCuenta,
        EstadoCuentaUtil.esActivo(estadoCuenta));
  }
}
