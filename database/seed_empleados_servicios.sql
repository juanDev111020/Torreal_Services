-- Datos de ejemplo: servicios, tarifas y empleados por especialidad (ejecutar en torreal_db).
USE torreal_db;

INSERT INTO servicios (nombre, descripcion) VALUES
  ('Salvavidas', 'Servicio de salvavidas en piscinas y clubes'),
  ('Jardinería', 'Mantenimiento de zonas verdes')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

INSERT INTO tarifas (id_servicio, tipo_cobro, precio)
SELECT s.id, 'Por Hora', 25000.00 FROM servicios s WHERE s.nombre = 'Salvavidas'
  AND NOT EXISTS (SELECT 1 FROM tarifas t WHERE t.id_servicio = s.id);

INSERT INTO tarifas (id_servicio, tipo_cobro, precio)
SELECT s.id, 'Por Hora', 18000.00 FROM servicios s WHERE s.nombre = 'Jardinería'
  AND NOT EXISTS (SELECT 1 FROM tarifas t WHERE t.id_servicio = s.id);

INSERT INTO usuarios (rol, email, password, nombre_completo, telefono, especialidad, estado_laboral)
SELECT 'Empleado', 'salvavidas@torreal.test', '$2a$10$placeholder', 'Carlos Salvavidas', '3001112233', 'Salvavidas', 'Activo'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'salvavidas@torreal.test');

INSERT INTO usuarios (rol, email, password, nombre_completo, telefono, especialidad, estado_laboral)
SELECT 'Empleado', 'todero@torreal.test', '$2a$10$placeholder', 'Pedro Todero', '3004445566', 'Todero', 'Activo'
WHERE NOT EXISTS (SELECT 1 FROM usuarios WHERE email = 'todero@torreal.test');
