package com.torreal.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.torreal.api.entity.Servicio;

public interface ServicioRepository extends JpaRepository<Servicio, Long> {

  /**
   * Solo columnas usadas por el front; evita fallos si la tabla tiene más columnas que la entidad JPA.
   */
  @Query(
      value = "SELECT id, nombre, descripcion FROM servicios ORDER BY id",
      nativeQuery = true)
  List<Object[]> findAllParaListadoPublico();


}
