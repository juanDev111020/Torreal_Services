package com.torreal.api.service.impl;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataAccessException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.domain.TorrealZonaHoraria;
import com.torreal.api.dto.AgendamientoClienteCardDto;
import com.torreal.api.dto.PerfilClienteResponseDto;
import com.torreal.api.entity.Cliente;
import com.torreal.api.entity.Tarifa;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.AgendamientoRepository;
import com.torreal.api.repository.TarifaRepository;
import com.torreal.api.service.ClienteAccesoService;
import com.torreal.api.service.ClientePerfilService;
import com.torreal.api.util.AgendamientoCancelacionUtil;
import com.torreal.api.util.AgendamientoPrecioUtil;
import com.torreal.api.util.EstadoCuentaUtil;
import com.torreal.api.util.NativeRowMapper;
import com.torreal.api.util.TarifaTipoClienteUtil;

@Service
public class ClientePerfilServiceImpl implements ClientePerfilService {

  private static final Logger log = LoggerFactory.getLogger(ClientePerfilServiceImpl.class);
  private static final DateTimeFormatter FMT_FECHA = DateTimeFormatter.ofPattern("dd/MM/yyyy");
  private static final DateTimeFormatter FMT_HORA = DateTimeFormatter.ofPattern("HH:mm");

  private final ClienteAccesoService clienteAccesoService;
  private final AgendamientoRepository agendamientoRepository;
  private final TarifaRepository tarifaRepository;

  public ClientePerfilServiceImpl(
      ClienteAccesoService clienteAccesoService,
      AgendamientoRepository agendamientoRepository,
      TarifaRepository tarifaRepository) {
    this.clienteAccesoService = clienteAccesoService;
    this.agendamientoRepository = agendamientoRepository;
    this.tarifaRepository = tarifaRepository;
  }

  @Override
  public PerfilClienteResponseDto miPerfil(long usuarioId) {
    Cliente cliente = clienteAccesoService.obtenerClienteParaUsuario(usuarioId);
    Usuario u = cliente.getUsuario();
    if (u == null || !RolUsuario.esCliente(u.getRol())) {
      throw new ApiBusinessException(HttpStatus.FORBIDDEN, "Acceso solo para clientes.");
    }

    String tipoTarifa =
        TarifaTipoClienteUtil.normalizarParaTarifa(
            cliente.getTipoCliente() != null ? cliente.getTipoCliente() : "");
    List<AgendamientoClienteCardDto> cards = cargarAgendamientosSeguro(cliente.getId(), tipoTarifa);
    String estadoCuenta = EstadoCuentaUtil.normalizarCliente(cliente.getEstado());
    boolean activo = EstadoCuentaUtil.esActivo(estadoCuenta);

    return new PerfilClienteResponseDto(
        u.getNombreCompleto() != null ? u.getNombreCompleto() : "",
        u.getEmail() != null ? u.getEmail() : "",
        u.getTelefono() != null ? u.getTelefono() : "",
        cliente.getDireccion() != null ? cliente.getDireccion() : "",
        cliente.getTipoCliente() != null ? cliente.getTipoCliente() : "",
        cliente.getNitPh() != null ? cliente.getNitPh() : "",
        cliente.getPersonaContacto() != null ? cliente.getPersonaContacto() : "",
        estadoCuenta,
        activo,
        cards);
  }

  private List<AgendamientoClienteCardDto> cargarAgendamientosSeguro(
      long clienteId, String tipoTarifa) {
    try {
      List<AgendamientoClienteCardDto> cards = new ArrayList<>();
      for (Object[] row : agendamientoRepository.findAgendamientosPorCliente(clienteId)) {
        cards.add(mapearFila(row, tipoTarifa));
      }
      return cards;
    } catch (DataAccessException ex) {
      log.warn("Listado de agendamientos omitido para cliente {}: {}", clienteId, ex.getMessage());
      return List.of();
    }
  }

  private AgendamientoClienteCardDto mapearFila(Object[] row, String tipoTarifa) {
    long id = NativeRowMapper.toLong(row[0]);
    Instant inicio = NativeRowMapper.toInstant(row[1]);
    Instant fin = NativeRowMapper.toInstant(row[2]);
    String estado = NativeRowMapper.str(row[3]);
    String servicioNombre = NativeRowMapper.str(row[4]);
    long servicioId = NativeRowMapper.toLong(row[5]);
    String empleado = NativeRowMapper.str(row[6]);

    Tarifa tarifa = null;
    try {
      tarifa =
          tarifaRepository.findByServicio_IdAndTipoCliente(servicioId, tipoTarifa).orElse(null);
    } catch (DataAccessException ex) {
      log.debug("Tarifa no disponible para servicio {}", servicioId);
    }

    String tipoCobro = "Por hora";
    BigDecimal precioPorHora =
        tarifa != null && tarifa.getPrecio() != null ? tarifa.getPrecio() : BigDecimal.ZERO;
    BigDecimal total =
        inicio != null
            ? AgendamientoPrecioUtil.calcularTotal(tarifa, inicio, fin != null ? fin : inicio)
            : BigDecimal.ZERO;
    boolean puedeCancelar = AgendamientoCancelacionUtil.puedeCancelar(inicio, estado);

    String fechaInicioStr =
        inicio != null ? FMT_FECHA.format(inicio.atZone(TorrealZonaHoraria.BOGOTA)) : "";
    String fechaFinStr =
        fin != null ? FMT_FECHA.format(fin.atZone(TorrealZonaHoraria.BOGOTA)) : fechaInicioStr;
    String horarioDiario = "";
    if (inicio != null && fin != null) {
      horarioDiario =
          FMT_HORA.format(inicio.atZone(TorrealZonaHoraria.BOGOTA))
              + " - "
              + FMT_HORA.format(fin.atZone(TorrealZonaHoraria.BOGOTA));
    }

    return new AgendamientoClienteCardDto(
        id,
        servicioNombre,
        fechaInicioStr,
        fechaFinStr,
        horarioDiario,
        estado,
        empleado,
        tipoCobro,
        precioPorHora,
        total,
        puedeCancelar);
  }
}
