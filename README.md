# Torreal Service

Aplicación web **Torreal S.A.S** (Angular + API Java + MySQL).

## Uso normal — solo Docker (recomendado)

No necesitas instalar Node, Java ni Maven para usar el proyecto en otra PC.

### Requisitos

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado y en ejecución (“Running”).

### Primera vez (o tras clonar el repo)

1. Abre la carpeta del proyecto.
2. Doble clic en **`Torreal-Iniciar.cmd`** (construye imágenes y levanta todo).
3. Se abrirá **http://127.0.0.1:4200** (app + API por el mismo puerto).

### Después (mismo PC)

- Con **`restart: unless-stopped`**, al abrir Docker Desktop los contenedores **vuelven solos** si ya los habías iniciado antes (no hace falta volver a ejecutar comandos).
- Si no aparecen: doble clic otra vez en **`Torreal-Iniciar.cmd`**.

### Detener

- Doble clic en **`Torreal-Detener.cmd`**.

### Credenciales de prueba

- **Super usuario:** `super@torreal.local` / `Torreal@Super2026`

### Importante

| Correcto | Incorrecto |
|----------|------------|
| Entrar a **http://127.0.0.1:4200** con `torreal_web`, `torreal_api`, `torreal_mysql` activos (`docker ps`) | Usar **http://localhost:4200** si sigue abierto `npm start` (Angular dev en IPv6, sin la API de Docker) |
| Solo Docker Desktop abierto | Tener `ng serve` y Docker a la vez en el puerto **4200** |

Más detalle: [DOCKER.md](DOCKER.md).

## Trabajo en equipo (Git Flow)

Ramas: **`master`** (estable) · **`develop`** (integración) · **`Dev1`** / **`Dev2`** (cada desarrollador).

Guía completa: [GITFLOW.md](GITFLOW.md)

---

## Desarrollo con código en el host (opcional)

Solo si vas a modificar Angular o la API fuera de Docker:

```bash
docker compose up -d mysql api   # BD + API en Docker
npm start                        # Angular con proxy a :8080
```

O API con Maven: `npm run api:java` (requiere JDK 17+ y Maven).

---

## Angular CLI (referencia)

Documentación generada por Angular CLI 21. Ver [angular.dev](https://angular.dev).
