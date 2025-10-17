#!/usr/bin/env powershell
# Quick start script for the complete development environment

Write-Host "🚀 Starting Complete Webscraper Development Environment" -ForegroundColor Green
Write-Host ""

# Start Mock API Server in background
Write-Host "📡 Starting Mock API Server..." -ForegroundColor Blue
Start-Process python -ArgumentList "mock-api-server.py" -WindowStyle Hidden

# Wait a moment for server to start
Start-Sleep -Seconds 2

# Test if API server is running
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8000/articles/results/test" -UseBasicParsing -TimeoutSec 5
    Write-Host "✅ Mock API Server is running on http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start Mock API Server" -ForegroundColor Red
    Write-Host "Starting manually..." -ForegroundColor Yellow
    python mock-api-server.py
    return
}

Write-Host ""
Write-Host "🌐 Starting React Frontend..." -ForegroundColor Blue

# Set Node options for compatibility
$env:NODE_OPTIONS = "--openssl-legacy-provider"
$env:PORT = "3001"

# Start React development server
npm start

Write-Host ""
Write-Host "🎉 Development Environment Ready!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Backend API: http://localhost:8000" -ForegroundColor Cyan