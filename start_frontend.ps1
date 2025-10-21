#!/usr/bin/env pwsh

# Simple Frontend Launcher Script
Write-Host "🎨 Starting React Frontend..." -ForegroundColor Green

# Set Node options for compatibility
$env:NODE_OPTIONS = "--openssl-legacy-provider"

Write-Host "⚙️  Node options set: $env:NODE_OPTIONS" -ForegroundColor Yellow
Write-Host "🌐 Frontend will run on: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🔗 Backend should be running on: http://localhost:8080" -ForegroundColor Yellow
Write-Host "📦 Starting npm..." -ForegroundColor Green

# Start the React development server
npm start