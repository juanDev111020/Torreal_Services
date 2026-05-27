package com.torreal.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.torreal.api.entity.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

  Optional<Usuario> findByEmailIgnoreCase(String email);

  boolean existsByEmailIgnoreCase(String email);

  @Query(
      """
      SELECT u FROM Usuario u
      WHERE u.rol = 'Empleado'
        AND LOWER(u.especialidad) = LOWER(:especialidad)
        AND (LOWER(u.estadoLaboral) = 'activo' OR u.estadoLaboral IS NULL)
      ORDER BY u.id ASC
      """)
  List<Usuario> findEmpleadosActivosPorEspecialidad(@Param("especialidad") String especialidad);

  @Query("SELECT u FROM Usuario u WHERE u.rol = 'Empleado' ORDER BY u.nombreCompleto ASC")
  List<Usuario> findAllEmpleados();
}