# torreal-api (Spring Boot)

Backend Java que replica la API REST del servidor Node en `../server/`.

## Requisitos

- JDK 17+
- Maven 3.9+
- MySQL con el esquema de [../database/init.sql](../database/init.sql) (puerto por defecto **3308** como en el proyecto Docker).

## Configuración

Variables opcionales (también puedes editar `src/main/resources/application.properties`):

| Variable | Descripción |
|----------|-------------|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Conexión MySQL |
| `JWT_SECRET` | Secreto firmado JWT (en producción debe ser largo y aleatorio) |
| `JWT_EXPIRES_DAYS` | Días de validez del token (por defecto 7) |
| `TORREAL_UPLOADS_DIR` | Carpeta donde se guardan los CV (por defecto `./uploads` relativo al directorio de trabajo) |
| `CORS_ORIGINS` | Orígenes permitidos, separados por coma (por defecto `http://localhost:4200`) |

## Ejecutar

Desde esta carpeta (`torreal-api`):

```bash
mvn spring-boot-run
```

La API queda en **http://localhost:8080** (mismo prefijo `/api/...` que el front).

## Front (Angular)

Actualiza la URL base del API, por ejemplo en `src/app/core/api-base-url.ts`, a:

`http://localhost:8080`

Los usuarios deben **volver a iniciar sesión** tras cambiar de Node a Spring (los JWT no son intercambiables).

## Problemas frecuentes

### Login devuelve `No se pudo acceder a la base de datos` o error 503

La API necesita **MySQL accesible** con el esquema `torreal_db`. Con Docker del proyecto:

```bash
cd database
docker compose up -d
```

El mapeo de puertos es **3308** en el host → 3306 en el contenedor (ver `database/docker-compose.yml`). Usuario/contraseña por defecto: `torreal_admin` / `admin123`.

Si MySQL está en otro puerto o host, define variables de entorno al arrancar Spring, por ejemplo:

`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`

Revisa la **consola donde corre Spring**: ahora se registra el error JDBC completo y la respuesta JSON suele indicar si es conexión rechazada, acceso denegado o base inexistente.

Si tu base ya existía antes de `fecha_fin_servicio`, ejecuta también:

`../database/migrate_agendamiento_fecha_fin.sql`
