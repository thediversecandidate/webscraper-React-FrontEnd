#!/usr/bin/env powershell
# Alternative setup with simplified dependencies

Write-Host "🚀 Setting up Webscraper Backend (Simplified)..." -ForegroundColor Green

$BackendPath = "C:\Users\DerrickAlford\OneDrive - thediversecandidate Limited Liability Co\Documents\GitHub\Webscraping\django\derrick"

Set-Location $BackendPath

# Activate virtual environment if it exists
if (Test-Path "venv\Scripts\Activate.ps1") {
    & ".\venv\Scripts\Activate.ps1"
}

Write-Host "📦 Installing essential Django dependencies..." -ForegroundColor Blue

# Install core dependencies that work with Python 3.13
pip install Django==3.2.25
pip install djangorestframework==3.12.4
pip install django-cors-headers==3.13.0
pip install requests==2.32.3
pip install python-dateutil==2.8.1
pip install Pillow==10.4.0
pip install beautifulsoup4==4.12.3

Write-Host "🗄️ Using SQLite for simplified setup..." -ForegroundColor Blue

# Create a minimal settings file override
$settingsOverride = @"
# Simplified settings for local development
import os
from .settings import *

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Disable Elasticsearch for now
INSTALLED_APPS = [app for app in INSTALLED_APPS if 'django_elasticsearch_dsl' not in app]

# Allow all hosts for development
ALLOWED_HOSTS = ['*']

DEBUG = True
"@

$settingsOverride | Out-File -FilePath "derrick\local_settings.py" -Encoding UTF8

# Create a simple local manage script
$localManage = @"
#!/usr/bin/env python
import os
import sys

if __name__ == '__main__':
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'derrick.local_settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)
"@

$localManage | Out-File -FilePath "local_manage.py" -Encoding UTF8

Write-Host "🔄 Running Django setup..." -ForegroundColor Blue
python local_manage.py migrate
python local_manage.py collectstatic --noinput

Write-Host ""
Write-Host "🎉 Simplified setup complete! 🎉" -ForegroundColor Green
Write-Host ""
Write-Host "To start the backend:" -ForegroundColor Yellow
Write-Host "  cd '$BackendPath'" -ForegroundColor Gray
Write-Host "  .\venv\Scripts\Activate.ps1" -ForegroundColor Gray
Write-Host "  python local_manage.py runserver 0.0.0.0:8000" -ForegroundColor Gray
Write-Host ""
Write-Host "This setup uses SQLite and skips Elasticsearch for simplicity." -ForegroundColor Cyan