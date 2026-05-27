package com.torreal.api.service.impl;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.torreal.api.domain.RolUsuario;
import com.torreal.api.domain.TorrealZonaHoraria;
import com.torreal.api.dto.AgendamientoCreadoResponseDto;
import com.torreal.api.dto.CrearAgendamientoRequest;
import com.torreal.api.entity.Agendamiento;
import com.torreal.api.entity.Cliente;
import com.torreal.api.entity.Servicio;
import com.torreal.api.entity.Usuario;
import com.torreal.api.exception.ApiBusinessException;
import com.torreal.api.repository.AgendamientoRepository;
import com.torreal.api.repository.ServicioRepository;
import com.torreal.api.repository.UsuarioRepository;
import com.torreal.api.service.ClienteAccesoService;
import com.torreal.api.service.ClienteAgendamientoService;
import com.torreal.api.util.AgendamientoCancelacionUtil;
import com.torreal.api.util.AgendamientoFechasValidacion;
import com.torreal.api.util.EstadoCuentaUtil;
import com.torreal.api.util.ServicioEspecialidad;

@Service
public class ClienteAgendamientoServiceImpl implements ClienteAgendamientoService {

  /** Valor del ENUM `estado` en la tabla agendamientos de esta instalación. */
  private static final String ESTADO_ASIGNADO = "En Proceso";
  private static final String ESTADO_CANCELADO = "Cancelado";

  private final ClienteAccesoService clienteAccesoService;
  private final ServicioRepository servicioRepository;
  private final UsuarioRepository usuarioRepository;
  private final AgendamientoRepository agendamientoRepository;

  public ClienteAgendamientoServiceImpl(
      ClienteAccesoService clienteAccesoService,
      ServicioRepository servicioRepository,
      UsuarioRepository usuarioRepository,
      AgendamientoRepository agendamientoRepository) {
    this.clienteAccesoService = clienteAccesoService;
    this.servicioRepository = servicioRepository;
    this.usuarioRepository = usuarioRepository;
    this.agendamientoRepository = agendamientoRepository;
  }

  @Override
  @Transactional
  public AgendamientoCreadoResponseDto crear(long usuarioId, CrearAgendamientoRequest req) {
    Cliente cliente = clienteAccesoService.obtenerClienteParaUsuario(usuarioId);
    Usuario usuario = cliente.getUsuario();
    if (usuario == null || !RolUsuario.esCliente(usuario.getRol())) {
      throw new ApiBusinessException(HttpStatus.FORBIDDEN, "Solo clientes pueden agendar servicios.");
    }
    if (!EstadoCuentaUtil.esClienteActivo(cliente)) {
      throw new ApiBusinessException(
          HttpStatus.FORBIDDEN,
          "Tu cuenta está inactiva. Contacta a Torreal para reactivarla.");
    }

    if (req.idServicio() <= 0) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Selecciona un servicio.");
    }

    Servicio servicio =
        servicioRepository
            .findById(req.idServicio())
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.BAD_REQUEST, "Servicio no válido."));

    if (req.horaFin() == null || req.horaFin().isBlank()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Indica la hora de fin.");
    }

    AgendamientoFechasValidacion.validarFechasTexto(
        req.fechaInicio(), req.fechaFin(), req.horaInicio(), req.horaFin());

    Instant inicio = parsearInicio(req.fechaInicio(), req.horaInicio());
    Instant fin = parsearFin(req.fechaFin(), req.horaFin(), inicio);
    AgendamientoFechasValidacion.validarRangoFuturo(inicio, fin);

    if (req.direccion() != null && !req.direccion().trim().isEmpty()) {
      cliente.setDireccion(req.direccion().trim());
    }
    if (req.nit() != null && !req.nit().trim().isEmpty()) {
      cliente.setNitPh(req.nit().trim());
    }

    String especialidad = ServicioEspecialidad.especialidadRequerida(servicio.getNombre());
    if (especialidad == null || especialidad.isBlank()) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST, "No se pudo determinar la especialidad requerida para el servicio.");
    }

    List<Usuario> candidatos = usuarioRepository.findEmpleadosActivosPorEspecialidad(especialidad);
    if (candidatos.isEmpty()) {
      throw new ApiBusinessException(
          HttpStatus.CONFLICT,
          "No hay empleados con especialidad "
              + especialidad
              + " disponibles. Intenta otras fechas o contacta a Torreal.");
    }

    Usuario empleadoAsignado = null;
    for (Usuario emp : candidatos) {
      long solapes =
          agendamientoRepository.countSolapamientosEmpleado(emp.getId(), inicio, fin);
      if (solapes == 0) {
        empleadoAsignado = emp;
        break;
      }
    }

    if (empleadoAsignado == null) {
      throw new ApiBusinessException(
          HttpStatus.CONFLICT,
          "No hay personal "
              + especialidad
              + " libre en las fechas indicadas. Elige otro rango.");
    }

    String nombreReserva = resolverNombreCliente(req.nombreCliente(), usuario.getNombreCompleto());
    if (!nombreReserva.equals(usuario.getNombreCompleto())) {
      usuario.setNombreCompleto(nombreReserva);
      usuarioRepository.save(usuario);
    }

    Agendamiento ag = new Agendamiento();
    ag.setCliente(cliente);
    ag.setNombreCliente(nombreReserva);
    ag.setServicio(servicio);
    ag.setEmpleado(empleadoAsignado);
    ag.setFechaProgramada(inicio);
    ag.setFechaFinServicio(fin);
    ag.setEstado(ESTADO_ASIGNADO);
    agendamientoRepository.save(ag);

    String nombreEmp =
        empleadoAsignado.getNombreCompleto() != null
            ? empleadoAsignado.getNombreCompleto()
            : "Empleado asignado";

    return new AgendamientoCreadoResponseDto(
        ag.getId(),
        "Servicio agendado correctamente. Se asignó a " + nombreEmp + ".",
        nombreEmp,
        ESTADO_ASIGNADO);
  }

  @Override
  @Transactional
  public void cancelar(long usuarioId, long agendamientoId) {
    if (agendamientoId <= 0) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Reserva no válida.");
    }
    Agendamiento ag =
        agendamientoRepository
            .findByIdAndClienteUsuarioId(agendamientoId, usuarioId)
            .orElseThrow(
                () -> new ApiBusinessException(HttpStatus.NOT_FOUND, "Reserva no encontrada."));

    String estado = ag.getEstado() != null ? ag.getEstado() : "";
    if (!AgendamientoCancelacionUtil.esEstadoCancelable(estado)) {
      throw new ApiBusinessException(
          HttpStatus.CONFLICT, "Esta reserva ya está cancelada o finalizada.");
    }
    Instant inicio = ag.getFechaProgramada();
    if (!AgendamientoCancelacionUtil.puedeCancelar(inicio, estado)) {
      throw new ApiBusinessException(
          HttpStatus.BAD_REQUEST,
          "Solo puedes cancelar con al menos 24 horas de anticipación al inicio del servicio.");
    }
    ag.setEstado(ESTADO_CANCELADO);
    agendamientoRepository.save(ag);
  }

  private static String resolverNombreCliente(String desdeFormulario, String desdePerfil) {
    String form = desdeFormulario != null ? desdeFormulario.trim() : "";
    if (!form.isEmpty()) {
      return form;
    }
    String perfil = desdePerfil != null ? desdePerfil.trim() : "";
    return perfil.isEmpty() ? "Cliente" : perfil;
  }

  private static Instant parsearInicio(String fecha, String hora) {
    if (fecha == null || fecha.isBlank()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Indica la fecha de inicio.");
    }
    try {
      LocalDate d = LocalDate.parse(fecha.trim());
      LocalTime t =
          hora != null && !hora.isBlank()
              ? LocalTime.parse(hora.trim())
              : LocalTime.of(8, 0);
      return d.atTime(t).atZone(TorrealZonaHoraria.BOGOTA).toInstant();
    } catch (DateTimeParseException e) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Fecha u hora de inicio no válida.");
    }
  }

  private static Instant parsearFin(String fechaFin, String horaFin, Instant inicio) {
    if (fechaFin == null || fechaFin.isBlank()) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Indica la fecha de fin.");
    }
    try {
      LocalDate d = LocalDate.parse(fechaFin.trim());
      LocalTime t =
          horaFin != null && !horaFin.isBlank()
              ? LocalTime.parse(horaFin.trim())
              : LocalTime.of(18, 0);
      return d.atTime(t).atZone(TorrealZonaHoraria.BOGOTA).toInstant();
    } catch (DateTimeParseException e) {
      throw new ApiBusinessException(HttpStatus.BAD_REQUEST, "Fecha u hora de fin no válida.");
    }
  }
}
