package com.torreal.api.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.torreal.api.exception.ApiBusinessException;

public final class TorrealSecurity {

  private TorrealSecurity() {}

  public static TorrealAuthentication requireUsuario() {
    Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
    if (authentication instanceof TorrealAuthentication torreal) {
      return torreal;
    }
    throw new ApiBusinessException(HttpStatus.UNAUTHORIZED, "Sesión requerida. Inicia sesión de nuevo.");
  }
}
