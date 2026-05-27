-- Ejecutar en torreal_db si la tabla clientes ya existía sin nit_ph / persona_contacto
-- o con ENUM tipo_cliente antiguo (Natural/Empresa). Revisa datos antes si usabas 'Empresa'.

ALTER TABLE clientes ADD COLUMN nit_ph VARCHAR(50) NULL AFTER tipo_cliente;
ALTER TABLE clientes ADD COLUMN persona_contacto VARCHAR(150) NULL AFTER nit_ph;

ALTER TABLE clientes
  MODIFY COLUMN tipo_cliente ENUM('Natural', 'Propiedad horizontal') DEFAULT 'Natural';

-- Si alguna columna ya existía, comenta la línea correspondiente (error 1060 Duplicate column).
