package com.torreal.api.entity;

import java.time.Instant;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "postulaciones")
public class Postulacion {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "nombre_completo", nullable = false, length = 150)
  private String nombreCompleto;

  @Column(nullable = false, length = 150)
  private String correo;

  @Column(name = "archivo_cv_url", length = 255)
  private String archivoCvUrl;

  @Column(name = "fecha_envio", insertable = false, updatable = false)
  private Instant fechaEnvio;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getNombreCompleto() {
    return nombreCompleto;
  }

  public void setNombreCompleto(String nombreCompleto) {
    this.nombreCompleto = nombreCompleto;
  }

  public String getCorreo() {
    return correo;
  }

  public void setCorreo(String correo) {
    this.correo = correo;
  }

  public String getArchivoCvUrl() {
    return archivoCvUrl;
  }

  public void setArchivoCvUrl(String archivoCvUrl) {
    this.archivoCvUrl = archivoCvUrl;
  }

  public Instant getFechaEnvio() {
    return fechaEnvio;
  }
}
