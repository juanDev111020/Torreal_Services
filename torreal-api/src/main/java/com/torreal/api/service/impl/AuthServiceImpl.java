package com.torreal.api.service.impl;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.dto.AuthRegisterRequest;
import com.torreal.api.dto.LoginRequestDto;
import com.torreal.api.dto.LoginResponseDto;
import com.torreal.api.dto.RegistroOkResponseDto;
import com.torreal.api.dto.UsuarioSesionDto;
import com.torreal.api.entity.Cliente;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.ClienteRepository;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.security.JwtService;
import com.torreal.api.service.AuthService;
import com.torreal.api.util.NitColombia;
import com.torreal.api.util.RegistroValidacion;

@Service
public class AuthServiceImpl implements AuthService {

  private static final String ESTADO_LABORAL_DEFAULT = "Activo";

  private final UsuarioRepository usuarioRepository;
  private final ClienteRepository clienteRepository;
  private final PasswordEncoder passwordEncoder;
  private final JwtService jwtService;

  public AuthServiceImpl(
      UsuarioRepository usuarioRepository,
      ClienteRepository clienteRepository,
      PasswordEncoder passwordEncoder,
      JwtService jwtService) {
    this.usuarioRepository = usuarioRepository;
    this.clienteRepository = clienteRepository;
    this.passwordEncoder = passwordEncoder;
    this.jwtService = jwtService;
  }

  @Override
  @Transactional
  public RegistroOkResponseDto register(AuthRegisterRequest req) {
    String tipo = req.getTipo() == null ? "" : req.getTipo().trim().toLowerCase();
    String email = normalizeEmail(req.getEmail());
    String password = req.getPassword() != null ? req.getPassword() : "";
    String nombreCompleto = trimOrEmpty(req.getNombreCompleto());
    String telefonoDigits =
        req.getTelefono() != null ? req.getTelefono().replaceAll("\\D", "") : "";
    if (telefonoDigits.length() > 10) {
      telefonoDigits = telefonoDigits.substring(0, 10);
    }

    if (email.isEmpty() || password.isEmpty() || nombreCompleto.isEmpty() || telefonoDigits.isEmpty()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Completa nombre, correo, teléfono y contraseña.");
    }

    String errPass = RegistroValidacion.validarPasswordRegistro(password);
    if (errPass != null) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, errPass);
    }
    String errTel = RegistroValidacion.validarTelefonoCo(telefonoDigits);
    if (errTel != null) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, errTel);
    }

    if ("empleado".equals(tipo)) {
      throw new ApiBusinessException(
          HttpStatus.FORBIDDEN,
          "El registro de empleados solo puede realizarlo el super usuario desde el panel de administración.");
    }

    if ("cliente".equals(tipo)) {
      String subtipo =
          req.getTipoCliente() == null ? "natural" : req.getTipoCliente().trim().toLowerCase();
      String tipoClienteDb =
          "propiedad_horizontal".equals(subtipo) ? "Propiedad horizontal" : "Natural";

      String nitPh =
          req.getNitPh() != null && !req.getNitPh().trim().isEmpty() ? req.getNitPh().trim() : null;
      String personaContacto =
          req.getPersonaContacto() != null ? req.getPersonaContacto().trim() : "";
      String direccion = req.getDireccion() != null ? req.getDireccion().trim() : "";

      if ("Propiedad horizontal".equals(tipoClienteDb)) {
        NitColombia.NitResult nitRes = NitColombia.validarYNormalizarNitPh(nitPh != null ? nitPh : "");
        if (!nitRes.ok()) {
          throw new ApiBusinessException(HttpStatus.BAD_REQUEST, nitRes.error());
        }
        nitPh = nitRes.nit();
      } else {
        nitPh = null;
        personaContacto = null;
      }

      if ("Propiedad horizontal".equals(tipoClienteDb)) {
        personaContacto = personaContacto.isEmpty() ? null : personaContacto;
      }

      Usuario u = new Usuario();
      u.setRol(RolUsuario.CLIENTE);
      u.setEmail(email);
      u.setPassword(passwordEncoder.encode(password));
      u.setNombreCompleto(nombreCompleto);
      u.setTelefono(telefonoDigits);
      u.setEspecialidad(null);
      u.setEstadoLaboral(ESTADO_LABORAL_DEFAULT);
      usuarioRepository.save(u);

      Cliente c = new Cliente();
      c.setUsuario(u);
      c.setDireccion(direccion.isEmpty() ? null : direccion);
      c.setTipoCliente(tipoClienteDb);
      c.setNitPh(nitPh);
      c.setPersonaContacto(personaContacto);
      c.setEstado("activo");
      clienteRepository.save(c);

      return new RegistroOkResponseDto(true);
    }

    throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Tipo de registro no válido.");
  }

  @Override
  @Transactional(readOnly = true)
  public LoginResponseDto login(LoginRequestDto request) {
    String email = normalizeEmail(request.email());
    String password = request.password() != null ? request.password() : "";
    if (email.isEmpty() || password.isEmpty()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Indica correo y contraseña.");
    }
    Usuario user =
        usuarioRepository
            .findByEmailIgnoreCase(email)
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas."));
    if (!passwordEncoder.matches(password, user.getPassword())) {
      throw new ApiBusinessException(HttpStatus.UNAUTHORIZED, "Credenciales incorrectas.");
    }
    String rolStr = user.getRol() != null ? user.getRol() : "";
    String token = jwtService.crearToken(user.getId(), rolStr);
    UsuarioSesionDto sesion =
        new UsuarioSesionDto(
            user.getId(),
            user.getEmail(),
            rolStr,
            user.getNombreCompleto() != null ? user.getNombreCompleto() : "");
    return new LoginResponseDto(token, sesion);
  }

  private static String normalizeEmail(String email) {
    return email == null ? "" : email.trim().toLowerCase();
  }

  private static String trimOrEmpty(String s) {
    return s == null ? "" : s.trim();
  }
}
