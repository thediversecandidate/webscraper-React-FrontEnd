#!/usr/bin/env pwsh

# Real Web Scraper - Complete Launcher
Write-Host "🚀 Starting REAL Web Scraper Full Stack Application..." -ForegroundColor Green
Write-Host "🌐 This scrapes REAL articles from actual websites!" -ForegroundColor Cyan

# Function to check if port is in use
function Test-Port($port) {
    try {
        $connection = Test-NetConnection -ComputerName localhost -Port $port -WarningAction SilentlyContinue
        return $connection.TcpTestSucceeded
    } catch {
        return $false
    }
}

Write-Host "🔧 Checking backend status..." -ForegroundColor Yellow

# Check if real backend is already running
if (Test-Port 8080) {
    Write-Host "✅ Real web scraper backend already running on port 8080" -ForegroundColor Green
} else {
    Write-Host "🔍 Starting REAL Web Scraper Backend..." -ForegroundColor Cyan
    Write-Host "📊 Data sources: Reddit, HackerNews, Dev.to, GitHub" -ForegroundColor White
    
    # Start real scraper backend
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command", 
        "cd '$PWD'; .\backend_venv\Scripts\Activate.ps1; python real_scraper_backend.py"
    )
    
    Write-Host "⏳ Waiting for real backend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 8
    
    # Verify backend is running
    $attempts = 0
    while (-not (Test-Port 8080) -and $attempts -lt 10) {
        Start-Sleep -Seconds 3
        $attempts++
        Write-Host "⏳ Still waiting for backend... ($attempts/10)" -ForegroundColor Yellow
    }
    
    if (Test-Port 8080) {
        Write-Host "✅ Real web scraper backend started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Backend failed to start on port 8080" -ForegroundColor Red
        exit 1
    }
}

# Check if frontend is already running
Write-Host "🎨 Checking frontend status..." -ForegroundColor Yellow

if (Test-Port 3001) {
    Write-Host "✅ Frontend already running on port 3001" -ForegroundColor Green
} else {
    Write-Host "🎨 Starting React Frontend..." -ForegroundColor Cyan
    
    # Set Node options and start frontend
    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "cd '$PWD'; `$env:NODE_OPTIONS='--openssl-legacy-provider'; npm start"
    )
    
    Write-Host "⏳ Waiting for frontend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 12
    
    # Verify frontend is running
    $attempts = 0
    while (-not (Test-Port 3001) -and $attempts -lt 15) {
        Start-Sleep -Seconds 3
        $attempts++
        Write-Host "⏳ Still waiting for frontend... ($attempts/15)" -ForegroundColor Yellow
    }
    
    if (Test-Port 3001) {
        Write-Host "✅ Frontend server started successfully!" -ForegroundColor Green
    } else {
        Write-Host "❌ Frontend failed to start on port 3001" -ForegroundColor Red
    }
}

Write-Host "`n🎉 REAL Web Scraper Application Status:" -ForegroundColor Green
Write-Host "   🔍 Real Backend API: http://localhost:8080" -ForegroundColor Cyan
Write-Host "   🎨 Frontend App: http://localhost:3001" -ForegroundColor Cyan

Write-Host "`n🌐 Open http://localhost:3001 in your browser!" -ForegroundColor Yellow
Write-Host "🔍 Try searching for:" -ForegroundColor White
Write-Host "   - 'python' - Real Python articles from Reddit, HN, Dev.to" -ForegroundColor Gray
Write-Host "   - 'javascript' - Real JS articles and repos" -ForegroundColor Gray
Write-Host "   - 'ai' or 'machine learning' - Real AI content" -ForegroundColor Gray
Write-Host "   - 'react' - Real React tutorials and discussions" -ForegroundColor Gray

Write-Host "`n📋 Real API endpoints:" -ForegroundColor White
Write-Host "   - Health: http://localhost:8080/health" -ForegroundColor Gray
Write-Host "   - Search: http://localhost:8080/articles/search/{term}/{first}/{last}/{order}" -ForegroundColor Gray
Write-Host "   - Count: http://localhost:8080/articles/results/{term}" -ForegroundColor Gray

Write-Host "`n⚡ Features:" -ForegroundColor Yellow
Write-Host "   ✅ Scrapes REAL articles from actual websites" -ForegroundColor Green
Write-Host "   ✅ Word clouds from real article content" -ForegroundColor Green
Write-Host "   ✅ Caching for performance (5min TTL)" -ForegroundColor Green
Write-Host "   ✅ Multiple data sources (Reddit, HN, Dev.to, GitHub)" -ForegroundColor Green

Write-Host "`n⚠️  Note: First search takes 10-15 seconds (scraping real data)" -ForegroundColor Yellow
Write-Host "⏹️  To stop servers, close their respective terminal windows" -ForegroundColor Yellow