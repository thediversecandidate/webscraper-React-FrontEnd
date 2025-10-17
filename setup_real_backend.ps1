#!/usr/bin/env pwsh

# Real Django Backend Setup Script
Write-Host "🔧 Setting up Real Django Backend for Webscraper..." -ForegroundColor Green

# Check if Python is available
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Found Python: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python not found! Please install Python 3.8+ first." -ForegroundColor Red
    exit 1
}

# Create virtual environment if it doesn't exist
$venvPath = ".\backend_venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "📦 Creating virtual environment..." -ForegroundColor Yellow
    python -m venv $venvPath
}

# Activate virtual environment
Write-Host "🔄 Activating virtual environment..." -ForegroundColor Yellow
& "$venvPath\Scripts\Activate.ps1"

# Upgrade pip
Write-Host "⬆️  Upgrading pip..." -ForegroundColor Yellow
python -m pip install --upgrade pip

# Install requirements
Write-Host "📥 Installing Django and dependencies..." -ForegroundColor Yellow
pip install -r backend_requirements.txt

# Test Django installation
Write-Host "🧪 Testing Django installation..." -ForegroundColor Yellow
python -c "import django; print(f'Django {django.get_version()} installed successfully!')"

Write-Host "`n✅ Backend setup complete!" -ForegroundColor Green
Write-Host "🚀 To start the backend server, run:" -ForegroundColor Cyan
Write-Host "   python django_backend.py" -ForegroundColor White
Write-Host "`n🌐 The backend will run on: http://localhost:8000" -ForegroundColor Cyan
Write-Host "🔗 Make sure your frontend is configured to use this URL" -ForegroundColor Yellow