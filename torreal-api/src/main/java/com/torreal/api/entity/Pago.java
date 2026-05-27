package com.torreal.api.entity;

import java.math.BigDecimal;
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
@Table(name = "pagos")
public class Pago {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(fetch = FetchType.LAZY, optional = false)
  @JoinColumn(name = "id_agendamiento", nullable = false)
  private Agendamiento agendamiento;

  @Column(name = "monto_total", nullable = false, precision = 12, scale = 2)
  private BigDecimal montoTotal;

  @Column(name = "transaccion_id", length = 150)
  private String transaccionId;

  @Column(name = "metodo_pago", length = 50)
  private String metodoPago;

  @Column(name = "fecha_pago")
  private Instant fechaPago;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Agendamiento getAgendamiento() {
    return agendamiento;
  }

  public void setAgendamiento(Agendamiento agendamiento) {
    this.agendamiento = agendamiento;
  }

  public BigDecimal getMontoTotal() {
    return montoTotal;
  }

  public void setMontoTotal(BigDecimal montoTotal) {
    this.montoTotal = montoTotal;
  }

  public String getTransaccionId() {
    return transaccionId;
  }

  public void setTransaccionId(String transaccionId) {
    this.transaccionId = transaccionId;
  }

  public String getMetodoPago() {
    return metodoPago;
  }

  public void setMetodoPago(String metodoPago) {
    this.metodoPago = metodoPago;
  }

  public Instant getFechaPago() {
    return fechaPago;
  }

  public void setFechaPago(Instant fechaPago) {
    this.fechaPago = fechaPago;
  }
}
