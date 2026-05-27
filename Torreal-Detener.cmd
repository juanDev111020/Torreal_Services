@echo off
cd /d "%~dp0"
echo Deteniendo Torreal (contenedores Docker)...
docker compose down
echo.
echo Listo. Los datos de MySQL y uploads se conservan en volumenes Docker.
pause
