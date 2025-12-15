# Smart Complaint System - PowerShell Startup Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   Smart Complaint System - Startup" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Check if virtual environment exists
if (-not (Test-Path ".venv\Scripts\python.exe")) {
    Write-Host "❌ Virtual environment not found!" -ForegroundColor Red
    Write-Host "Please run: python -m venv .venv" -ForegroundColor Yellow
    Write-Host "Then: .venv\Scripts\pip install -r backend\requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath ".venv\Scripts\python.exe" -ArgumentList "backend\run_server.py" -PassThru -WindowStyle Normal

Write-Host "⏳ Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

Write-Host "🎬 Starting Frontend Server..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath ".venv\Scripts\python.exe" -ArgumentList "frontend\server.py" -PassThru -WindowStyle Normal

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   🎉 Servers Started Successfully!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔗 Backend API:  http://localhost:5000" -ForegroundColor Blue
Write-Host "🎬 Frontend App: http://localhost:5173" -ForegroundColor Blue
Write-Host ""
Write-Host "👤 Admin Login Credentials:" -ForegroundColor Yellow
Write-Host "   📧 Email:    admin@college.edu" -ForegroundColor White
Write-Host "   🔑 Password: admin123" -ForegroundColor White
Write-Host ""
Write-Host "✨ Features Available:" -ForegroundColor Magenta
Write-Host "   • Real-time form validation" -ForegroundColor White
Write-Host "   • Status filter buttons" -ForegroundColor White
Write-Host "   • Netflix-style animations" -ForegroundColor White
Write-Host "   • Mobile responsive design" -ForegroundColor White
Write-Host ""

# Wait a moment for servers to fully start
Start-Sleep -Seconds 3

Write-Host "🌐 Opening application in browser..." -ForegroundColor Green
Start-Process "http://localhost:5173"

Write-Host ""
Write-Host "📝 Note: Both servers are running in the background." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop this script, then close server windows to stop servers." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this script (servers will continue running)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "✅ Startup script completed. Servers are still running." -ForegroundColor Green
Write-Host "🔗 Access your app at: http://localhost:5173" -ForegroundColor Blue