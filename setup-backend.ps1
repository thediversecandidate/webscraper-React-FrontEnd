#!/usr/bin/env powershell
# Quick setup script for local backend development

Write-Host "🚀 Setting up Webscraper Backend locally..." -ForegroundColor Green

$BackendPath = "C:\Users\DerrickAlford\OneDrive - thediversecandidate Limited Liability Co\Documents\GitHub\Webscraping\django\derrick"

# Check if backend directory exists
if (-not (Test-Path $BackendPath)) {
    Write-Host "❌ Backend directory not found at: $BackendPath" -ForegroundColor Red
    Write-Host "Please ensure the Webscraping repository is cloned." -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Backend directory found" -ForegroundColor Green

# Navigate to backend
Set-Location $BackendPath

# Check for Python
try {
    $pythonVersion = python --version
    Write-Host "✅ Python found: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found. Please install Python 3.9+" -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
if (-not (Test-Path "venv")) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Blue
    python -m venv venv
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Blue
& ".\venv\Scripts\Activate.ps1"

# Install requirements
Write-Host "📚 Installing Python dependencies..." -ForegroundColor Blue
pip install -r requirements.txt

# Set environment variables for development
$env:DEBUG = "1"
$env:DATABASE_URL = "sqlite:///db.sqlite3"

Write-Host "🗄️ Setting up database..." -ForegroundColor Blue
python manage.py migrate

Write-Host "📁 Collecting static files..." -ForegroundColor Blue
python manage.py collectstatic --noinput

Write-Host "" 
Write-Host "🎉 Setup complete! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "To start the backend server:" -ForegroundColor Yellow
Write-Host "  cd '$BackendPath'" -ForegroundColor Gray
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray  
Write-Host "  python manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "Frontend is configured to use: http://localhost:8000" -ForegroundColor Cyan
Write-Host "Admin interface will be at: http://localhost:8000/admin" -ForegroundColor Cyan