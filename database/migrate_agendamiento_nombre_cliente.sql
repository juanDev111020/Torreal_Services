-- Guarda el nombre del cliente al momento de agendar (visible en calendario del empleado).
USE torreal_db;

ALTER TABLE agendamientos
  ADD COLUMN nombre_cliente VARCHAR(150) NULL AFTER id_cliente;

UPDATE agendamientos a
INNER JOIN clientes c ON c.id = a.id_cliente
INNER JOIN usuarios u ON u.id = c.id_usuario
SET a.nombre_cliente = u.nombre_completo
WHERE a.nombre_cliente IS NULL OR TRIM(a.nombre_cliente) = '';
