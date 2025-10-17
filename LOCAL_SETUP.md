# Local Development Setup Guide

## Quick Start with Python Virtual Environment

### Prerequisites
- Python 3.9+
- Git

### Setup Steps

1. **Navigate to backend directory:**
   ```powershell
   cd "C:\Users\DerrickAlford\OneDrive - thediversecandidate Limited Liability Co\Documents\GitHub\Webscraping\django\derrick"
   ```

2. **Create and activate virtual environment:**
   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   ```

3. **Install dependencies:**
   ```powershell
   pip install -r requirements.txt
   ```

4. **Setup environment variables:**
   ```powershell
   $env:DEBUG = "1"
   $env:DATABASE_URL = "sqlite:///db.sqlite3"  # Use SQLite for simplicity
   ```

5. **Run Django setup:**
   ```powershell
   python manage.py migrate
   python manage.py createsuperuser  # Optional: create admin user
   python manage.py collectstatic --noinput
   ```

6. **Start the backend server:**
   ```powershell
   python manage.py runserver 0.0.0.0:8000
   ```

### Frontend Configuration
The frontend is already configured to use `http://localhost:8000` when `useLocalBackend = true` in `Api.ts`.

### Testing
1. Backend API: http://localhost:8000/admin
2. Frontend: http://localhost:3001
3. Test API endpoint: http://localhost:8000/articles/results/test

## Docker Setup (Alternative)

If you prefer Docker, use the provided docker-compose.yml:

```powershell
# From the frontend directory
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379  
- Elasticsearch on port 9200
- Django Backend on port 80
- React Frontend on port 3001

## Troubleshooting

### Backend Issues:
- **Database errors**: Try using SQLite first (simpler setup)
- **Port conflicts**: Change port in `runserver` command
- **Dependencies**: Make sure all requirements.txt packages install

### Frontend Issues:
- **CORS errors**: Backend includes django-cors-headers
- **API connection**: Check `useLocalBackend` flag in Api.ts
- **Node issues**: Use `NODE_OPTIONS=--openssl-legacy-provider`