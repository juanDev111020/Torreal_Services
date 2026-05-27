# Torreal — Docker

Stack completo con **MySQL 8**, **API Spring Boot** y **frontend Angular** (nginx con proxy a la API).

## Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (o Docker Engine + Compose v2)
- Puertos libres: **4200** (web), **8080** (API, opcional), **3308** (MySQL, opcional)

## Arranque rápido

```powershell
cd "c:\Users\USUARIO\OneDrive\Doc. universidad\m-Proy-Torreal\Torreal_service"
docker compose up --build
```

### Conflictos habituales

| Error | Causa | Qué hacer |
|-------|--------|-----------|
| `container name "/torreal_mysql" is already in use` | MySQL de desarrollo (`database/docker-compose.yml`) sigue corriendo | `docker compose -f database/docker-compose.yml down` o `docker stop torreal_mysql_dev torreal_mysql` |
| `bind: ... :8080` | La API local (`npm run api:java`) u otro proceso usa el puerto | Detén ese proceso o define `API_HOST_PORT=8081` en `.env` |
| "No se pudo conectar con el servidor" en el navegador | `npm start` sigue en **4200** y abres **localhost:4200** (IPv6 → Angular sin API) | Cierra `npm start` y entra a **http://127.0.0.1:4200** |

No ejecutes a la vez el stack completo y `database/docker-compose.yml` en el puerto **3308** (mismo host). El compose de solo BD usa el contenedor `torreal_mysql_dev`.

- **Aplicación (recomendado):** http://127.0.0.1:4200  
- **API vía nginx:** http://127.0.0.1:4200/api/health  
- **API directa:** http://localhost:8080/api/health  
- **Super usuario:** `super@torreal.local` / `Torreal@Super2026`

La primera vez tarda varios minutos (descarga de imágenes + build Maven + npm).

## Desarrollo local (sin Docker)

Sigue igual que antes:

```powershell
# Solo base de datos
docker compose -f database/docker-compose.yml up -d

# API en el host
npm run api:java

# Frontend en el host
npm start
```

El frontend local usa rutas relativas `/api` con `proxy.conf.json` hacia `http://localhost:8080` (misma idea que nginx en Docker).

## Cómo funciona

| Servicio | Contenedor | Descripción |
|----------|------------|-------------|
| `mysql` | `torreal_mysql` | BD `torreal_db`, scripts en `database/docker/` |
| `api` | `torreal_api` | JAR Spring Boot, volumen `torreal_uploads` |
| `web` | `torreal_web` | nginx sirve Angular y hace proxy `/api` y `/uploads` → `api` |

El build del frontend usa la configuración Angular **`docker`**: las peticiones van a `/api/...` (mismo origen), sin problemas de CORS.

## Comandos útiles

```powershell
# Segundo plano
docker compose up --build -d

# Ver logs
docker compose logs -f api

# Parar
docker compose down

# Parar y borrar BD + uploads (reinicio limpio)
docker compose down -v
```

Scripts npm (desde `package.json`):

```powershell
npm run docker:up
npm run docker:down
```

## Variables de entorno

Copia `.env.example` → `.env` para personalizar puertos y secretos.

## Datos persistentes

- `torreal_mysql_data` — datos MySQL  
- `torreal_uploads` — CV y imágenes de novedades  

Si cambias el esquema SQL de init, borra el volumen: `docker compose down -v`.

## Reiniciar catálogo (6 servicios + tarifas)

Si hay servicios de más en la BD (demo/docker), ejecuta en MySQL:

```powershell
Get-Content database\reset-catalogo-servicios.sql | docker exec -i torreal_mysql mysql -u torreal_admin -padmin123 torreal_db
```

Borra agendamientos/pagos y deja solo: Jardinería, Aseo general, Servicio de salvavidas, Todero, Instalación de CCTV, Conserjería — cada uno con tarifa **Natural** y **Propiedad Horizontal** por hora.

## Solo MySQL (como antes)

```powershell
docker compose -f database/docker-compose.yml up -d
```

Usa `database/init.sql` (esquema histórico). Para el stack completo se usa `database/docker/01-schema.sql` (alineado con JPA).
