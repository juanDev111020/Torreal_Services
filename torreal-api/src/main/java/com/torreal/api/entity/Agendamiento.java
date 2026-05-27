package com.torreal.api.entity;

import java.time.Instant;

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
@Table(name = "agendamientos")
public class Agendamiento {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_cliente", nullable = false)
  private Cliente cliente;

  /** Nombre mostrado al empleado (propiedad o persona que agendó). */
  @Column(name = "nombre_cliente", length = 150)
  private String nombreCliente;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_servicio", nullable = false)
  private Servicio servicio;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "id_empleado")
  private Usuario empleado;

  @Column(name = "fecha_inicio", nullable = false)
  private Instant fechaProgramada;

  @Column(name = "fecha_fin", nullable = false)
  private Instant fechaFinServicio;

  @Column(length = 20)
  private String estado;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Cliente getCliente() {
    return cliente;
  }

  public void setCliente(Cliente cliente) {
    this.cliente = cliente;
  }

  public String getNombreCliente() {
    return nombreCliente;
  }

  public void setNombreCliente(String nombreCliente) {
    this.nombreCliente = nombreCliente;
  }

  public Servicio getServicio() {
    return servicio;
  }

  public void setServicio(Servicio servicio) {
    this.servicio = servicio;
  }

  public Usuario getEmpleado() {
    return empleado;
  }

  public void setEmpleado(Usuario empleado) {
    this.empleado = empleado;
  }

  public Instant getFechaProgramada() {
    return fechaProgramada;
  }

  public void setFechaProgramada(Instant fechaProgramada) {
    this.fechaProgramada = fechaProgramada;
  }

  public Instant getFechaFinServicio() {
    return fechaFinServicio;
  }

  public void setFechaFinServicio(Instant fechaFinServicio) {
    this.fechaFinServicio = fechaFinServicio;
  }

  public String getEstado() {
    return estado;
  }

  public void setEstado(String estado) {
    this.estado = estado;
  }
}
