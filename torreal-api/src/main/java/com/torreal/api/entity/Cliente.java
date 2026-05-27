package com.torreal.api.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "clientes")
public class Cliente {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_usuario", nullable = false)
  private Usuario usuario;

  @Column(length = 255)
  private String direccion;

  @Column(name = "tipo_cliente", length = 30)
  private String tipoCliente;

  @Column(name = "nit_ph", length = 50)
  private String nitPh;

  @Column(name = "persona_contacto", length = 150)
  private String personaContacto;

  /** activo | inactivo — clientes inactivos no pueden agendar. */
  @Column(length = 20)
  private String estado;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Usuario getUsuario() {
    return usuario;
  }

  public void setUsuario(Usuario usuario) {
    this.usuario = usuario;
  }

  public String getDireccion() {
    return direccion;
  }

  public void setDireccion(String direccion) {
    this.direccion = direccion;
  }

  public String getTipoCliente() {
    return tipoCliente;
  }

  public void setTipoCliente(String tipoCliente) {
    this.tipoCliente = tipoCliente;
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

  public String getEstado() {
    return estado;
  }

  public void setEstado(String estado) {
    this.estado = estado;
  }
}
