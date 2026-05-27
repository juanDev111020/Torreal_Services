package com.torreal.api.service.impl.admin;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.dto.AdminClienteDto;
import com.torreal.api.dto.AdminEmpleadoDto;
import com.torreal.api.entity.Cliente;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.AgendamientoRepository;
import com.torreal.api.repository.ClienteRepository;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.service.EmpleadoRegistroService;
import com.torreal.api.service.admin.AdminCuentaService;
import com.torreal.api.util.EstadoCuentaUtil;
import com.torreal.api.util.NativeRowMapper;

@Service
public class AdminCuentaServiceImpl implements AdminCuentaService {

  private final AgendamientoRepository agendamientoRepository;
  private final ClienteRepository clienteRepository;
  private final UsuarioRepository usuarioRepository;
  private final EmpleadoRegistroService empleadoRegistroService;

  public AdminCuentaServiceImpl(
      AgendamientoRepository agendamientoRepository,
      ClienteRepository clienteRepository,
      UsuarioRepository usuarioRepository,
      EmpleadoRegistroService empleadoRegistroService) {
    this.agendamientoRepository = agendamientoRepository;
    this.clienteRepository = clienteRepository;
    this.usuarioRepository = usuarioRepository;
    this.empleadoRegistroService = empleadoRegistroService;
  }

  @Override
  @Transactional(readOnly = true)
  public List<AdminClienteDto> listarClientes() {
    Instant ahora = Instant.now();
    List<AdminClienteDto> resultado = new ArrayList<>();
    for (Cliente cliente : clienteRepository.findAllWithUsuario()) {
      Usuario usuario = cliente.getUsuario();
      long total = agendamientoRepository.countPorCliente(cliente.getId());
      long activos = agendamientoRepository.countActivosPorCliente(cliente.getId(), ahora);
      String estado = EstadoCuentaUtil.normalizarCliente(cliente.getEstado());
      resultado.add(
          new AdminClienteDto(
              cliente.getId(),
              usuario != null ? usuario.getId() : 0,
              usuario != null ? NativeRowMapper.str(usuario.getNombreCompleto()) : "",
              usuario != null ? NativeRowMapper.str(usuario.getEmail()) : "",
              usuario != null ? NativeRowMapper.str(usuario.getTelefono()) : "",
              NativeRowMapper.str(cliente.getTipoCliente()),
              estado,
              EstadoCuentaUtil.esActivo(estado),
              total,
              activos,
              total > 0));
    }
    return resultado;
  }

  @Override
  @Transactional
  public void cambiarEstadoCliente(long clienteId, String estado) {
    String estadoValido = EstadoCuentaUtil.validarActivoInactivo(estado);
    Cliente cliente =
        clienteRepository
            .findById(clienteId)
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.NOT_FOUND, "Cliente no encontrado."));
    cliente.setEstado(estadoValido);
    clienteRepository.save(cliente);
  }

  @Override
  @Transactional(readOnly = true)
  public List<AdminEmpleadoDto> listarEmpleados() {
    Instant ahora = Instant.now();
    List<AdminEmpleadoDto> resultado = new ArrayList<>();
    for (Usuario usuario : usuarioRepository.findAllEmpleados()) {
      long total = agendamientoRepository.countPorEmpleado(usuario.getId());
      long activos = agendamientoRepository.countActivosPorEmpleado(usuario.getId(), ahora);
      String estado = EstadoCuentaUtil.normalizarEmpleado(usuario.getEstadoLaboral());
      resultado.add(
          new AdminEmpleadoDto(
              usuario.getId(),
              NativeRowMapper.str(usuario.getNombreCompleto()),
              NativeRowMapper.str(usuario.getEmail()),
              NativeRowMapper.str(usuario.getTelefono()),
              NativeRowMapper.str(usuario.getEspecialidad()),
              estado,
              EstadoCuentaUtil.esActivo(estado),
              activos > 0,
              total,
              activos));
    }
    return resultado;
  }

  @Override
  @Transactional
  public void cambiarEstadoEmpleado(long empleadoId, String estado) {
    String estadoValido = EstadoCuentaUtil.validarActivoInactivo(estado);
    Usuario usuario =
        usuarioRepository
            .findById(empleadoId)
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.NOT_FOUND, "Empleado no encontrado."));
    if (!RolUsuario.esEmpleado(usuario.getRol())) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "El usuario no es empleado.");
    }
    usuario.setEstadoLaboral(estadoValido);
    usuarioRepository.save(usuario);
  }

  @Override
  @Transactional
  public void registrarEmpleado(
      String email, String password, String nombreCompleto, String telefono, String especialidad) {
    empleadoRegistroService.registrarEmpleado(email, password, nombreCompleto, telefono, especialidad);
  }
}
