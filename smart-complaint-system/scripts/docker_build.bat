@echo off
REM Docker Build and Deploy Script for Smart Complaint System (Windows)

setlocal enabledelayedexpansion

echo 🐳 Smart Complaint System - Docker Build ^& Deploy
echo ==================================================

REM Check if Docker is running
echo [INFO] Checking Docker installation...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker is not installed!
    exit /b 1
)

docker info >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker daemon is not running!
    exit /b 1
)

echo [SUCCESS] Docker is running

REM Check database connection
echo [INFO] Checking database connection...
python scripts\check_db_size.py >nul 2>&1
if errorlevel 1 (
    echo [WARNING] Database connection failed - continuing anyway
) else (
    echo [SUCCESS] Database connection successful
)

REM Build Docker image
echo [INFO] Building Docker image...

REM Create logs directory
if not exist logs mkdir logs

REM Build the image
docker build -t smart-complaint-system:latest .
if errorlevel 1 (
    echo [ERROR] Docker build failed!
    exit /b 1
)

echo [SUCCESS] Docker image built successfully

REM Deploy with Docker Compose
echo [INFO] Deploying with Docker Compose...

REM Copy environment file if it doesn't exist
if not exist .env (
    copy .env.docker .env
    echo [WARNING] Created .env from .env.docker template
    echo [WARNING] Please update .env with your actual values
)

REM Start services
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] Docker Compose deployment failed!
    exit /b 1
)

echo [SUCCESS] Services deployed successfully

REM Show service status
echo [INFO] Service Status:
docker-compose ps

echo.
echo [INFO] Service URLs:
echo   🌐 Frontend: http://localhost
echo   📡 Backend API: http://localhost:5000
echo   🏥 Health Check: http://localhost:5000/api/health
echo   📊 Redis: localhost:6379

echo.
echo [INFO] Recent logs:
docker-compose logs --tail=20

echo.
echo ✅ Deployment completed successfully!
echo.
echo 💡 Useful commands:
echo   docker-compose ps          - Show service status
echo   docker-compose logs        - Show logs
echo   docker-compose down        - Stop services
echo   docker-compose restart     - Restart services

pause