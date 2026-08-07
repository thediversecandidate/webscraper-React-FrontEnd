# Local Development Setup Guide

## Quick Start with Python Virtual Environment

### Prerequisites
- Python 3.9+
- Git

### Setup Steps

1. **Navigate to backend directory:**
   ```powershell
   cd <your-checkout>/Webscraping/django/derrick
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
Point the frontend at this backend by setting `VITE_API_BASEURL=http://localhost:8000` in a `.env.local` file at the repo root.
(There is no `useLocalBackend` flag in `Api.ts` — this doc used to describe one; URL selection is env-var driven.)

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
- **API connection**: check `VITE_API_BASEURL` in your `.env.local`, and `src/Services/Api.ts` for the resolution order
- **Node issues**: do NOT set `NODE_OPTIONS=--openssl-legacy-provider`. That was a webpack-4/CRA workaround; this project builds with Vite and re-enabling a deprecated OpenSSL provider has no upside. Use Node 20+.