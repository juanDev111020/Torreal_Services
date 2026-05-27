-- Fecha/hora de finalización del servicio (además de fecha_programada = inicio).
USE torreal_db;

ALTER TABLE agendamientos
  ADD COLUMN fecha_fin_servicio DATETIME NULL
  AFTER fecha_programada;
