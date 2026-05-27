package com.torreal.api.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuthRegisterRequest {

  private String tipo;
  private String email;
  private String password;
  private String nombreCompleto;
  private String telefono;
  private String especialidad;
  private String tipoCliente;
  private String direccion;
  private String nitPh;
  private String personaContacto;
  /** Obligatorio al registrar empleados: código de 6 dígitos del super usuario. */
  private String tokenRegistro;

  public String getTipo() {
    return tipo;
  }

  public void setTipo(String tipo) {
    this.tipo = tipo;
  }

  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  public String getNombreCompleto() {
    return nombreCompleto;
  }

  public void setNombreCompleto(String nombreCompleto) {
    this.nombreCompleto = nombreCompleto;
  }

  public String getTelefono() {
    return telefono;
  }

  public void setTelefono(String telefono) {
    this.telefono = telefono;
  }

  public String getEspecialidad() {
    return especialidad;
  }

  public void setEspecialidad(String especialidad) {
    this.especialidad = especialidad;
  }

  public String getTipoCliente() {
    return tipoCliente;
  }

  public void setTipoCliente(String tipoCliente) {
    this.tipoCliente = tipoCliente;
  }

  public String getDireccion() {
    return direccion;
  }

  public void setDireccion(String direccion) {
    this.direccion = direccion;
  }

  public String getNitPh() {
    return nitPh;
  }

  public void setNitPh(String nitPh) {
    this.nitPh = nitPh;
  }

  public String getPersonaContacto() {
    return personaContacto;
  }

  public void setPersonaContacto(String personaContacto) {
    this.personaContacto = personaContacto;
  }

  public String getTokenRegistro() {
    return tokenRegistro;
  }

  public void setTokenRegistro(String tokenRegistro) {
    this.tokenRegistro = tokenRegistro;
  }
}
