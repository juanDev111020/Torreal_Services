-- Opcional: alinear agendamientos al esquema de database/init.sql (fecha_programada, fecha_fin_servicio).
-- Solo ejecutar si quieres renombrar columnas; la API Java ya soporta fecha_inicio / fecha_fin.
USE torreal_db;

-- Renombrar solo si existen las columnas antiguas:
-- ALTER TABLE agendamientos
--   CHANGE COLUMN fecha_inicio fecha_programada DATETIME NOT NULL,
--   CHANGE COLUMN fecha_fin fecha_fin_servicio DATETIME NULL;
