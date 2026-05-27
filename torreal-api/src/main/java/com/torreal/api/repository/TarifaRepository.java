package com.torreal.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.torreal.api.entity.Tarifa;

public interface TarifaRepository extends JpaRepository<Tarifa, Long> {

  @Query(
      """
      SELECT t FROM Tarifa t JOIN FETCH t.servicio s
      WHERE s.id = :idServicio
        AND LOWER(TRIM(t.tipoCliente)) = LOWER(TRIM(:tipoCliente))
      """)
  Optional<Tarifa> findByServicio_IdAndTipoCliente(
      @Param("idServicio") long idServicio, @Param("tipoCliente") String tipoCliente);

  @Query(
      """
      SELECT t FROM Tarifa t JOIN FETCH t.servicio s
      WHERE LOWER(TRIM(t.tipoCliente)) = LOWER(TRIM(:tipoCliente))
      ORDER BY s.nombre ASC
      """)
  List<Tarifa> findByTipoCliente(@Param("tipoCliente") String tipoCliente);
}
