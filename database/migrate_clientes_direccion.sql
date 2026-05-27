-- Si la tabla clientes tiene `direccion_principal` y la API espera `direccion` (modelo ERD):
-- ALTER TABLE clientes CHANGE COLUMN direccion_principal direccion VARCHAR(255) NULL;

-- Si aún tienes columnas de cliente en usuarios antiguos (id_rol, empleados separados),
-- la API nueva solo funciona con el esquema ERD: recrea la BD desde database/init.sql
-- o migra manualmente los datos.
