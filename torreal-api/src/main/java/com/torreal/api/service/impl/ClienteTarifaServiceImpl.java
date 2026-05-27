package com.torreal.api.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.dto.TarifaClienteDto;
import com.torreal.api.entity.Cliente;
import com.torreal.api.entity.Tarifa;
import com.torreal.api.repository.TarifaRepository;
import com.torreal.api.service.ClienteAccesoService;
import com.torreal.api.service.ClienteTarifaService;
import com.torreal.api.util.TarifaTipoClienteUtil;

@Service
public class ClienteTarifaServiceImpl implements ClienteTarifaService {

  private final ClienteAccesoService clienteAccesoService;
  private final TarifaRepository tarifaRepository;

  public ClienteTarifaServiceImpl(
      ClienteAccesoService clienteAccesoService, TarifaRepository tarifaRepository) {
    this.clienteAccesoService = clienteAccesoService;
    this.tarifaRepository = tarifaRepository;
  }

  @Override
  @Transactional(readOnly = true)
  public List<TarifaClienteDto> tarifasParaUsuario(long usuarioId) {
    Cliente cliente = clienteAccesoService.obtenerClienteParaUsuario(usuarioId);
    String tipo =
        TarifaTipoClienteUtil.normalizarParaTarifa(
            cliente.getTipoCliente() != null ? cliente.getTipoCliente() : "");
    return tarifaRepository.findByTipoCliente(tipo).stream().map(this::mapear).toList();
  }

  private TarifaClienteDto mapear(Tarifa t) {
    long idServicio = t.getServicio() != null ? t.getServicio().getId() : 0L;
    return new TarifaClienteDto(idServicio, t.getPrecio());
  }
}
