-- Reinicia catálogo: solo 6 servicios + tarifas Natural/PH por hora.
-- Conserva usuarios/clientes; borra reservas y servicios extra.
-- Ejecutar en MySQL Workbench o: Get-Content database\reset-catalogo-servicios.sql | docker exec -i torreal_mysql mysql -u torreal_admin -padmin123

USE torreal_db;

SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;

DELETE FROM evaluaciones;
DELETE FROM pagos;
DELETE FROM agendamientos;
DELETE FROM postulaciones;
DELETE FROM tarifas;
DELETE FROM servicios;

SET FOREIGN_KEY_CHECKS = 1;

ALTER TABLE servicios AUTO_INCREMENT = 1;
ALTER TABLE tarifas AUTO_INCREMENT = 1;

INSERT INTO servicios (nombre, descripcion, estado) VALUES
  ('Jardinería', 'Mantenimiento integral de zonas verdes', 'Disponible'),
  ('Aseo general', 'Limpieza de oficinas y viviendas', 'Disponible'),
  ('Servicio de salvavidas', 'Vigilancia y seguridad en piscinas', 'Disponible'),
  ('Todero', 'Apoyo operativo y mantenimiento general', 'Disponible'),
  ('Instalación de CCTV', 'Instalación y soporte de cámaras de seguridad', 'Disponible'),
  ('Conserjería', 'Recepción, control de acceso y áreas comunes', 'Disponible');

INSERT INTO tarifas (id_servicio, tipo_cliente, precio)
SELECT s.id, 'Natural', 22000.00 FROM servicios s;

INSERT INTO tarifas (id_servicio, tipo_cliente, precio)
SELECT s.id, 'Propiedad Horizontal', 28000.00 FROM servicios s;
