package com.torreal.api.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.service.EmpleadoRegistroService;
import com.torreal.api.util.RegistroValidacion;

@Service
public class EmpleadoRegistroServiceImpl implements EmpleadoRegistroService {

  private static final String ESTADO_LABORAL_DEFAULT = "Activo";

  private final UsuarioRepository usuarioRepository;
  private final PasswordEncoder passwordEncoder;

  public EmpleadoRegistroServiceImpl(
      UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
    this.usuarioRepository = usuarioRepository;
    this.passwordEncoder = passwordEncoder;
  }

  @Override
  @Transactional
  public void registrarEmpleado(
      String emailRaw, String password, String nombreCompletoRaw, String telefonoRaw, String especialidadRaw) {
    String email = emailRaw == null ? "" : emailRaw.trim().toLowerCase();
    String nombreCompleto = nombreCompletoRaw == null ? "" : nombreCompletoRaw.trim();
    String telefonoDigits = telefonoRaw != null ? telefonoRaw.replaceAll("\\D", "") : "";
    if (telefonoDigits.length() > 10) {
      telefonoDigits = telefonoDigits.substring(0, 10);
    }
    String especialidad = especialidadRaw == null ? "" : especialidadRaw.trim();
    String pass = password != null ? password : "";

    if (email.isEmpty() || pass.isEmpty() || nombreCompleto.isEmpty() || telefonoDigits.isEmpty()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Completa nombre, correo, teléfono y contraseña.");
    }

    String errPass = RegistroValidacion.validarPasswordRegistro(pass);
    if (errPass != null) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, errPass);
    }
    String errTel = RegistroValidacion.validarTelefonoCo(telefonoDigits);
    if (errTel != null) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, errTel);
    }
    if (especialidad.isEmpty() || !RegistroValidacion.esEspecialidadValida(especialidad)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "Selecciona una especialidad válida de la lista.");
    }
    if (usuarioRepository.existsByEmailIgnoreCase(email)) {
      throw new ApiBusinessException(HttpStatus.CONFLICT, "Ya existe una cuenta con ese correo.");
    }

    Usuario u = new Usuario();
    u.setRol(RolUsuario.EMPLEADO);
    u.setEmail(email);
    u.setPassword(passwordEncoder.encode(pass));
    u.setNombreCompleto(nombreCompleto);
    u.setTelefono(telefonoDigits);
    u.setEspecialidad(especialidad);
    u.setEstadoLaboral(ESTADO_LABORAL_DEFAULT);
    usuarioRepository.save(u);
  }
}
