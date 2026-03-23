@echo off
setlocal
cd /d "%~dp0"

echo [1/3] Pulling latest changes from git...
git pull
if errorlevel 1 (
  echo Git pull failed.
  pause
  exit /b 1
)

echo [2/3] Rebuilding image...
docker compose build
if errorlevel 1 (
  echo Build failed.
  pause
  exit /b 1
)

echo [3/3] Restarting container...
docker compose up -d --remove-orphans
if errorlevel 1 (
  echo Restart failed.
  pause
  exit /b 1
)

echo.
echo Update and deploy completed.
echo.
pause
