-- Catálogo oficial Torreal (6 servicios de la sección "Nuestros servicios").
-- Tarifas por hora según tipo de cliente: Natural / Propiedad Horizontal.
USE torreal_db;
SET NAMES utf8mb4;

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

-- Super usuario: super@torreal.local / Torreal@Super2026
INSERT INTO usuarios (rol, email, password, nombre_completo, telefono, estado_laboral)
VALUES (
  'SuperUsuario',
  'super@torreal.local',
  '$2a$10$l4h9C1jd/4fn.wEHpMg/9.f18IZVyoJ57AMyrRTT.55xsROBI4Oqi',
  'Super Administrador Torreal',
  '3000000000',
  'activo'
);
