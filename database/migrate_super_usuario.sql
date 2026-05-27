-- SuperUsuario único + columnas de soporte admin
USE torreal_db;

ALTER TABLE usuarios MODIFY COLUMN rol VARCHAR(30) NOT NULL DEFAULT 'Cliente';

ALTER TABLE clientes
  ADD COLUMN estado VARCHAR(20) NOT NULL DEFAULT 'activo' AFTER id_usuario;

-- Columnas de novedades (omitir si ya existen)
-- ALTER TABLE novedades ADD COLUMN imagen_url VARCHAR(255) NULL;
-- ALTER TABLE novedades ADD COLUMN tipo VARCHAR(30) NULL;

-- Contraseña: Torreal@Super2026
-- IMPORTANTE: usar fix_super_password.sql si el hash se corrompió al insertar desde PowerShell.
INSERT INTO usuarios (rol, email, password, nombre_completo, telefono, estado_laboral)
SELECT
  'SuperUsuario',
  'super@torreal.local',
  '$2a$10$l4h9C1jd/4fn.wEHpMg/9.f18IZVyoJ57AMyrRTT.55xsROBI4Oqi',
  'Super Administrador Torreal',
  '3000000000',
  'activo'
WHERE NOT EXISTS (
  SELECT 1 FROM usuarios WHERE email = 'super@torreal.local'
);

UPDATE clientes SET estado = 'activo' WHERE estado IS NULL OR TRIM(estado) = '';
