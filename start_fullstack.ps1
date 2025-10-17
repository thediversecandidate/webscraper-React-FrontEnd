#!/usr/bin/env pwsh

# Full Stack Webscraper Launcher
Write-Host "🚀 Starting Full Stack Webscraper Application..." -ForegroundColor Green

# Function to check if port is in use
function Test-Port($port) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

# Check if backend is already running
if (Test-Port 8000) {
    Write-Host "⚠️  Backend already running on port 8000" -ForegroundColor Yellow
} else {
    Write-Host "🔧 Starting Django Backend Server..." -ForegroundColor Cyan
    
    # Activate virtual environment and start backend
    $backendProcess = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command", 
        "cd '$PWD'; & '.\backend_venv\Scripts\Activate.ps1'; python django_backend.py"
    ) -PassThru
    
    Write-Host "⏳ Waiting for backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Verify backend is running
    $attempts = 0
    while (-not (Test-Port 8000) -and $attempts -lt 10) {
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "⏳ Still waiting for backend... ($attempts/10)" -ForegroundColor Yellow
    }
    
    if (Test-Port 8000) {
        Write-Host "✅ Backend server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend failed to start on port 8000" -ForegroundColor Red
        exit 1
    }
}

# Check if frontend is already running
if (Test-Port 3001) {
    Write-Host "⚠️  Frontend already running on port 3001" -ForegroundColor Yellow
} else {
    Write-Host "🎨 Starting React Frontend..." -ForegroundColor Cyan
    
    # Set Node options and start frontend
    $env:NODE_OPTIONS = "--openssl-legacy-provider"
    
    $frontendProcess = Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$PWD'; `$env:NODE_OPTIONS='--openssl-legacy-provider'; npm start"
    ) -PassThru
    
    Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Verify frontend is running
    $attempts = 0
    while (-not (Test-Port 3001) -and $attempts -lt 15) {
        Start-Sleep -Seconds 2
        $attempts++
        Write-Host "⏳ Still waiting for frontend... ($attempts/15)" -ForegroundColor Yellow
    }
    
    if (Test-Port 3001) {
        Write-Host "✅ Frontend server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend failed to start on port 3001" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Full Stack Application Status:" -ForegroundColor Green
Write-Host "   🔧 Backend API: http://localhost:8000" -ForegroundColor Cyan
Write-Host "   🎨 Frontend App: http://localhost:3001" -ForegroundColor Cyan
Write-Host "`n🌐 Open http://localhost:3001 in your browser to use the app!" -ForegroundColor Yellow
Write-Host "📋 Available API endpoints:" -ForegroundColor White
Write-Host "   - Health Check: http://localhost:8000/health/" -ForegroundColor Gray
Write-Host "   - Search Articles: http://localhost:8000/articles/search/{term}/{first}/{last}/{order}" -ForegroundColor Gray
Write-Host "   - Article Count: http://localhost:8000/articles/results/{term}" -ForegroundColor Gray

Write-Host "`n⏹️  To stop both servers, close their respective terminal windows" -ForegroundColor Yellow