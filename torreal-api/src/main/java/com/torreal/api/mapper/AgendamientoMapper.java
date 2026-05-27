package com.torreal.api.mapper;

import com.torreal.api.dto.AgendamientoEmpleadoResponseDto;
import com.torreal.api.util.NativeRowMapper;

public final class AgendamientoMapper {

  private AgendamientoMapper() {}

  public static AgendamientoEmpleadoResponseDto fromNativeRow(Object[] row) {
    return new AgendamientoEmpleadoResponseDto(
        NativeRowMapper.toLong(row[0]),
        NativeRowMapper.toInstant(row[1]),
        NativeRowMapper.toInstant(row[2]),
        NativeRowMapper.str(row[3]),
        NativeRowMapper.str(row[4]),
        NativeRowMapper.str(row[5]));
  }
}
