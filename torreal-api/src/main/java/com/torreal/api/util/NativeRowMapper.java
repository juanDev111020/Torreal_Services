package com.torreal.api.util;

import java.sql.Timestamp;
import java.time.Instant;

/** Conversión segura de columnas devueltas por consultas SQL nativas (`Object[]`). */
public final class NativeRowMapper {

  private NativeRowMapper() {}

  public static String str(Object value) {
    return value != null ? String.valueOf(value) : "";
  }

  public static long toLong(Object value) {
    if (value instanceof Number number) {
      return number.longValue();
    }
    return Long.parseLong(String.valueOf(value));
  }

  public static Instant toInstant(Object value) {
    if (value == null) {
      return null;
    }
    if (value instanceof Timestamp timestamp) {
      return timestamp.toInstant();
    }
    if (value instanceof Instant instant) {
      return instant;
    }
    if (value instanceof java.util.Date date) {
      return date.toInstant();
    }
    return Instant.parse(String.valueOf(value));
  }
}
