@echo off
setlocal
cd /d "%~dp0"

echo [1/2] Building Docker image...
docker compose build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo [2/2] Starting container...
docker compose up -d
if errorlevel 1 (
  echo Deploy failed.
  pause
  exit /b 1
)

echo.
echo Project is deployed and running.
echo URL: http://localhost:3000
echo.
pause
