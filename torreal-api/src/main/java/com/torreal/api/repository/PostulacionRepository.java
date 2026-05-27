package com.torreal.api.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.torreal.api.entity.Postulacion;

public interface PostulacionRepository extends JpaRepository<Postulacion, Long> {

  List<Postulacion> findAllByOrderByFechaEnvioDesc();
}