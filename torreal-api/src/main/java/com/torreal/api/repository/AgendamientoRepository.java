package com.torreal.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.torreal.api.entity.Agendamiento;

public interface AgendamientoRepository extends JpaRepository<Agendamiento, Long> {

  @Query(
      value =
          """
          SELECT a.id,
                 a.fecha_inicio,
                 a.fecha_fin,
                 a.estado,
                 s.nombre AS servicio_nombre,
                 COALESCE(
                   NULLIF(TRIM(a.nombre_cliente), ''),
                   uc.nombre_completo
                 ) AS cliente_nombre
          FROM agendamientos a
          INNER JOIN servicios s ON s.id = a.id_servicio
          INNER JOIN clientes c ON c.id = a.id_cliente
          INNER JOIN usuarios uc ON uc.id = c.id_usuario
          WHERE a.id_empleado = :empleadoId
            AND YEAR(a.fecha_inicio) = :year
          ORDER BY a.fecha_inicio ASC
          """,
      nativeQuery = true)
  List<Object[]> findAgendamientosEmpleadoPorAnio(
      @Param("empleadoId") long empleadoId, @Param("year") int year);

  @Query(
      value =
          """
          SELECT COUNT(*) FROM agendamientos a
          WHERE a.id_empleado = :empleadoId
            AND a.estado NOT IN ('Cancelado', 'Finalizado')
            AND a.fecha_inicio < :fin
            AND a.fecha_fin > :inicio
          """,
      nativeQuery = true)
  long countSolapamientosEmpleado(
      @Param("empleadoId") long empleadoId,
      @Param("inicio") java.time.Instant inicio,
      @Param("fin") java.time.Instant fin);

  @Query(
      value =
          """
          SELECT a.id,
                 a.fecha_inicio,
                 a.fecha_fin,
                 a.estado,
                 s.nombre AS servicio_nombre,
                 s.id AS servicio_id,
                 ue.nombre_completo AS empleado_nombre
          FROM agendamientos a
          INNER JOIN servicios s ON s.id = a.id_servicio
          LEFT JOIN usuarios ue ON ue.id = a.id_empleado
          WHERE a.id_cliente = :clienteId
          ORDER BY a.fecha_inicio DESC
          """,
      nativeQuery = true)
  List<Object[]> findAgendamientosPorCliente(@Param("clienteId") long clienteId);

  @Query(
      """
      SELECT a FROM Agendamiento a
      JOIN FETCH a.cliente c
      JOIN FETCH c.usuario u
      WHERE a.id = :id AND u.id = :usuarioId
      """)
  Optional<Agendamiento> findByIdAndClienteUsuarioId(
      @Param("id") long id, @Param("usuarioId") long usuarioId);

  @Query(
      value =
          """
          SELECT a.id,
                 COALESCE(NULLIF(TRIM(a.nombre_cliente), ''), uc.nombre_completo) AS cliente_nombre,
                 ue.nombre_completo AS empleado_nombre,
                 s.nombre AS servicio_nombre,
                 a.fecha_inicio,
                 a.fecha_fin,
                 a.estado
          FROM agendamientos a
          INNER JOIN servicios s ON s.id = a.id_servicio
          INNER JOIN clientes c ON c.id = a.id_cliente
          INNER JOIN usuarios uc ON uc.id = c.id_usuario
          LEFT JOIN usuarios ue ON ue.id = a.id_empleado
          ORDER BY a.fecha_inicio DESC
          """,
      nativeQuery = true)
  List<Object[]> findTodosParaAdmin();

  @Query(
      value =
          """
          SELECT COUNT(*) FROM agendamientos a
          WHERE a.id_cliente = :clienteId
          """,
      nativeQuery = true)
  long countPorCliente(@Param("clienteId") long clienteId);

  @Query(
      value =
          """
          SELECT COUNT(*) FROM agendamientos a
          WHERE a.id_cliente = :clienteId
            AND LOWER(a.estado) NOT IN ('cancelado', 'finalizado')
            AND a.fecha_fin > :ahora
          """,
      nativeQuery = true)
  long countActivosPorCliente(
      @Param("clienteId") long clienteId, @Param("ahora") java.time.Instant ahora);

  @Query(
      value =
          """
          SELECT COUNT(*) FROM agendamientos a
          WHERE a.id_empleado = :empleadoId
          """,
      nativeQuery = true)
  long countPorEmpleado(@Param("empleadoId") long empleadoId);

  @Query(
      value =
          """
          SELECT COUNT(*) FROM agendamientos a
          WHERE a.id_empleado = :empleadoId
            AND LOWER(a.estado) NOT IN ('cancelado', 'finalizado')
            AND a.fecha_fin > :ahora
          """,
      nativeQuery = true)
  long countActivosPorEmpleado(
      @Param("empleadoId") long empleadoId, @Param("ahora") java.time.Instant ahora);
}
