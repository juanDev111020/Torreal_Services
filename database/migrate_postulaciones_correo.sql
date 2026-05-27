-- Migra desde el esquema antiguo del repositorio hacia el ERD actual (columnas postulaciones).
-- Ejecuta solo las sentencias que apliquen a tu tabla (comenta el resto).

-- Si existía correo_electronico:
-- ALTER TABLE postulaciones CHANGE COLUMN correo_electronico correo VARCHAR(150) NOT NULL;

-- Si existía ruta_cv:
-- ALTER TABLE postulaciones CHANGE COLUMN ruta_cv archivo_cv_url VARCHAR(255);

-- Si existía fecha_postulacion:
-- ALTER TABLE postulaciones CHANGE COLUMN fecha_postulacion fecha_envio TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

-- Si existía area_trabajo y ya no la quieres:
-- ALTER TABLE postulaciones DROP COLUMN area_trabajo;
