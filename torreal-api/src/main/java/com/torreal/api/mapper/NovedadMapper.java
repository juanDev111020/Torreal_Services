package com.torreal.api.mapper;

import com.torreal.api.dto.NovedadPublicaDto;
import com.torreal.api.entity.Novedad;
import com.torreal.api.util.NativeRowMapper;

public final class NovedadMapper {

  private NovedadMapper() {}

  public static NovedadPublicaDto toDto(Novedad novedad) {
    return new NovedadPublicaDto(
        novedad.getId(),
        NativeRowMapper.str(novedad.getTitulo()),
        NativeRowMapper.str(novedad.getContenido()),
        NativeRowMapper.str(novedad.getImagenUrl()));
  }
}
