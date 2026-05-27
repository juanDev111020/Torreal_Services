package com.torreal.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.torreal.api.entity.Cliente;

public interface ClienteRepository extends JpaRepository<Cliente, Long> {

  @Query("SELECT c FROM Cliente c JOIN FETCH c.usuario u WHERE u.id = :usuarioId")
  Optional<Cliente> findByUsuario_Id(@Param("usuarioId") long usuarioId);

  @Query("SELECT c FROM Cliente c JOIN FETCH c.usuario u ORDER BY u.nombreCompleto ASC")
  List<Cliente> findAllWithUsuario();
}
