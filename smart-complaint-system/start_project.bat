@echo off
echo ========================================
echo   Smart Complaint System - Startup
echo ========================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k ".venv\Scripts\python.exe backend\run_server.py"

echo Waiting for backend to initialize...
timeout /t 5 /nobreak > nul

echo Starting Frontend Server...
start "Frontend Server" cmd /k ".venv\Scripts\python.exe frontend\server.py"

echo.
echo ========================================
echo   Servers Starting...
echo ========================================
echo.
echo Backend:  http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Admin Login:
echo   Email: admin@college.edu
echo   Password: admin123
echo.
echo Press any key to open the application...
pause > nul

start http://localhost:5173

echo.
echo Both servers are running in separate windows.
echo Close those windows to stop the servers.
echo.
pause