package com.torreal.api.security;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import com.torreal.api.domain.RolUsuario;

/** Solo se registra en {@link SecurityConfiguration}; no usar {@code @Component} (evita doble filtro). */
public class JwtAuthenticationFilter extends OncePerRequestFilter {

  /** @deprecated Usar {@link RolUsuario#EMPLEADO}. */
  @Deprecated public static final String ROL_EMPLEADO = RolUsuario.EMPLEADO;
  /** @deprecated Usar {@link RolUsuario#CLIENTE}. */
  @Deprecated public static final String ROL_CLIENTE = RolUsuario.CLIENTE;
  /** @deprecated Usar {@link RolUsuario#SUPER_USUARIO}. */
  @Deprecated public static final String ROL_SUPER_USUARIO = RolUsuario.SUPER_USUARIO;

  private final JwtService jwtService;

  public JwtAuthenticationFilter(JwtService jwtService) {
    this.jwtService = jwtService;
  }

  @Override
  protected boolean shouldNotFilter(HttpServletRequest request) {
    return "OPTIONS".equalsIgnoreCase(request.getMethod());
  }

  @Override
  protected void doFilterInternal(
      @NonNull HttpServletRequest request,
      @NonNull HttpServletResponse response,
      @NonNull FilterChain filterChain)
      throws ServletException, IOException {

    String uri = request.getRequestURI();
    String rolRequerido = rolRequerido(uri);
    if (rolRequerido == null) {
      filterChain.doFilter(request, response);
      return;
    }

    String auth = request.getHeader("Authorization");
    String raw = auth != null ? auth.trim() : "";
    if (!raw.regionMatches(true, 0, "Bearer ", 0, 7)) {
      writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Sesión requerida. Inicia sesión de nuevo.");
      return;
    }
    String token = raw.substring(7).trim();
    if (token.isEmpty()) {
      writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Sesión requerida. Inicia sesión de nuevo.");
      return;
    }

    var parsed = jwtService.parsearValidar(token);
    if (parsed.isEmpty()) {
      writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Sesión expirada o no válida.");
      return;
    }
    JwtService.JwtPayload payload = parsed.get();
    if (payload.userId() <= 0) {
      writeJsonError(response, HttpServletResponse.SC_UNAUTHORIZED, "Sesión no válida.");
      return;
    }
    if (!rolesCoinciden(rolRequerido, payload.rol())) {
      writeJsonError(
          response,
          HttpServletResponse.SC_FORBIDDEN,
          "No tienes permiso para acceder a este recurso.");
      return;
    }

    TorrealAuthentication torrealAuth = new TorrealAuthentication(payload.userId(), payload.rol());
    SecurityContextHolder.getContext().setAuthentication(torrealAuth);
    filterChain.doFilter(request, response);
  }

  static boolean rolesCoinciden(String requerido, String enToken) {
    if (requerido == null || enToken == null) {
      return false;
    }
    return requerido.trim().equalsIgnoreCase(enToken.trim());
  }

  private static String rolRequerido(String uri) {
    if (uri == null) {
      return null;
    }
    if (uri.startsWith("/api/empleado")) {
      return RolUsuario.EMPLEADO;
    }
    if (uri.startsWith("/api/cliente")) {
      return RolUsuario.CLIENTE;
    }
    if (uri.startsWith("/api/admin")) {
      return RolUsuario.SUPER_USUARIO;
    }
    return null;
  }

  private static void writeJsonError(HttpServletResponse response, int status, String message)
      throws IOException {
    response.setStatus(status);
    response.setCharacterEncoding(StandardCharsets.UTF_8.name());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);
    String escaped = message.replace("\\", "\\\\").replace("\"", "\\\"");
    response.getWriter().write("{\"error\":\"" + escaped + "\"}");
  }
}
