-- Ejemplo: asignar un servicio a un empleado para probar el calendario (ajusta fechas o ids si hace falta).
USE torreal_db;

SET @id_empleado := (SELECT id FROM usuarios WHERE rol = 'Empleado' ORDER BY id LIMIT 1);
SET @id_cliente := (SELECT id FROM clientes ORDER BY id LIMIT 1);

INSERT INTO agendamientos (
  id_cliente,
  nombre_cliente,
  id_servicio,
  id_empleado,
  fecha_programada,
  fecha_fin_servicio,
  estado
)
SELECT
  @id_cliente,
  (SELECT u.nombre_completo FROM usuarios u INNER JOIN clientes c ON c.id_usuario = u.id WHERE c.id = @id_cliente LIMIT 1),
  (SELECT id FROM servicios ORDER BY id LIMIT 1),
  @id_empleado,
  '2026-05-18 09:00:00',
  '2026-05-18 12:00:00',
  'Asignado'
WHERE @id_empleado IS NOT NULL AND @id_cliente IS NOT NULL;
