package com.torreal.api.security;

import java.util.Collection;
import java.util.Collections;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;

public class TorrealAuthentication implements Authentication {

  private static final long serialVersionUID = 1L;

  private final long userId;
  private final String rol;
  private boolean authenticated = true;

  public TorrealAuthentication(long userId, String rol) {
    this.userId = userId;
    this.rol = rol;
  }

  public long getUserId() {
    return userId;
  }

  public String getRol() {
    return rol;
  }

  @Override
  public Collection<? extends GrantedAuthority> getAuthorities() {
    return Collections.emptyList();
  }

  @Override
  public Object getCredentials() {
    return null;
  }

  @Override
  public Object getDetails() {
    return null;
  }

  @Override
  public Object getPrincipal() {
    return userId;
  }

  @Override
  public boolean isAuthenticated() {
    return authenticated;
  }

  @Override
  public void setAuthenticated(boolean isAuthenticated) throws IllegalArgumentException {
    this.authenticated = isAuthenticated;
  }

  @Override
  public String getName() {
    return String.valueOf(userId);
  }
}
