package com.torreal.api.service.impl;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.torreal.api.dto.TokenRegistroEmpleadoDto;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.service.TokenRegistroEmpleadoService;

@Service
public class TokenRegistroEmpleadoServiceImpl implements TokenRegistroEmpleadoService {

  private static final Duration VIGENCIA = Duration.ofMinutes(3);
  private static final int VIGENCIA_SEG = (int) VIGENCIA.getSeconds();

  private final SecureRandom random = new SecureRandom();

  private String codigoActual;
  private Instant expiraEn;

  @Override
  public synchronized TokenRegistroEmpleadoDto obtenerTokenActual() {
    rotarSiVencido();
    int restantes = (int) Math.max(0, Duration.between(Instant.now(), expiraEn).getSeconds());
    return new TokenRegistroEmpleadoDto(codigoActual, restantes, VIGENCIA_SEG);
  }

  @Override
  public synchronized void validarParaRegistroEmpleado(String tokenIngresado) {
    rotarSiVencido();
    String ingresado = tokenIngresado != null ? tokenIngresado.trim() : "";
    if (!ingresado.matches("\\d{6}")) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "El token de registro debe tener 6 dígitos numéricos.");
    }
    if (!ingresado.equals(codigoActual)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST,
          "Token de registro incorrecto o vencido. Solicita el código actual al administrador.");
    }
  }

  private void rotarSiVencido() {
    Instant ahora = Instant.now();
    if (codigoActual == null || expiraEn == null || !ahora.isBefore(expiraEn)) {
      codigoActual = generarCodigo();
      expiraEn = ahora.plus(VIGENCIA);
    }
  }

  private String generarCodigo() {
    int n = 100_000 + random.nextInt(900_000);
    return String.valueOf(n);
  }
}
