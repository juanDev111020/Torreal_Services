package com.torreal.api.mapper;

import com.torreal.api.dto.AdminAgendamientoDto;
import com.torreal.api.util.NativeRowMapper;

public final class AdminAgendamientoMapper {

  private AdminAgendamientoMapper() {}

  public static AdminAgendamientoDto fromNativeRow(Object[] row) {
    return new AdminAgendamientoDto(
        NativeRowMapper.toLong(row[0]),
        NativeRowMapper.str(row[1]),
        NativeRowMapper.str(row[2]),
        NativeRowMapper.str(row[3]),
        NativeRowMapper.toInstant(row[4]),
        NativeRowMapper.toInstant(row[5]),
        NativeRowMapper.str(row[6]));
  }
}
