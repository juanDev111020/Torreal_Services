package com.torreal.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.torreal.api.entity.Novedad;

public interface NovedadRepository extends JpaRepository<Novedad, Long> {

  List<Novedad> findAllByOrderByFechaPublicacionDesc();
}
