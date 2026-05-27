@echo off
chcp 65001 >nul
cd /d "%~dp0"
title Torreal - Iniciar stack Docker

echo.
echo  Torreal: levantando MySQL + API + Web (primera vez puede tardar varios minutos)...
echo.

docker info >nul 2>&1
if errorlevel 1 (
  echo  ERROR: Docker Desktop no esta en ejecucion. Abrelo y espera a "Running".
  pause
  exit /b 1
)

docker compose up -d --build
if errorlevel 1 (
  echo.
  echo  ERROR: no se pudo iniciar Docker Compose.
  echo  - Cierra la terminal donde corre "npm start" si compite por el puerto 4200
  echo  - Si MySQL viejo bloquea el nombre: docker stop torreal_mysql ^&^& docker rm torreal_mysql
  pause
  exit /b 1
)

echo.
echo  Esperando que la API responda...
:wait_api
docker exec torreal_api wget -qO- http://127.0.0.1:8080/api/health >nul 2>&1
if errorlevel 1 (
  timeout /t 3 /nobreak >nul
  goto wait_api
)

echo.
powershell -NoProfile -Command ^
  "$ok = try { (Invoke-WebRequest -Uri 'http://127.0.0.1:4200/api/health' -UseBasicParsing -TimeoutSec 5).Content } catch { '' }; ^
   $bad = try { (Invoke-WebRequest -Uri 'http://localhost:4200/api/health' -UseBasicParsing -TimeoutSec 3).Content } catch { '' }; ^
   if ($ok -match 'ok' -and $bad -notmatch 'ok') { ^
     Write-Host '  AVISO: tienes npm start abierto. Cierra esa terminal o el navegador en localhost:4200 fallara.'; ^
     Write-Host '  Usa siempre: http://127.0.0.1:4200'; ^
   } elseif ($ok -notmatch 'ok') { Write-Host '  AVISO: la web aun no responde /api. Revisa: docker compose logs web' }"

echo.
echo  Listo: http://127.0.0.1:4200
echo  Super usuario: super@torreal.local / Torreal@Super2026
echo.
echo  No necesitas npm start ni mvn. Con Docker Desktop abierto los contenedores se reinician solos.
echo.

start "" "http://127.0.0.1:4200"
pause
