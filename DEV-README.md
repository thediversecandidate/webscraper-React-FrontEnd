# 🚀 Webscraper React Frontend - Development Guide

## Revolutionary Semantic Web Mining System
This project features a cutting-edge semantic web mining engine that uses **set theory** and **mathematical optimization** to dynamically discover content sources rather than relying on hard-coded APIs.

## 🔥 Quick Start (Gold Standard)

### One-Command Development
```bash
npm run dev
```
This automatically:
- ✅ Starts the semantic web mining engine (port 8080)
- ✅ Finds an available port for React (auto-detection)
- ✅ Handles graceful shutdown with Ctrl+C
- ✅ Provides real-time logs from both services

## 🛠️ Development Options

### 1. **Smart Development** (Recommended)
```bash
npm run dev                 # Full-stack with smart port detection
```

### 2. **Concurrent Simple**
```bash
npm run dev-concurrent      # Uses concurrently package
```

### 3. **Manual Control**
```bash
# Terminal 1: Start backend
npm run backend             # or: python semantic_web_mining_engine.py

# Terminal 2: Start frontend (smart port)
npm run start-smart

# Terminal 2: Start frontend (manual port)
PORT=3001 npm start
```

### 4. **Port-Specific**
```bash
PORT=3002 npm start         # Force specific port
```

## 🎯 Available Ports & Services

- **Backend API**: http://localhost:8080
- **Frontend**: Auto-detected (usually 3001, 3002, etc.)
- **Health Check**: http://localhost:8080/health

## 🧠 Testing the Semantic Algorithm

Once both servers are running, test these queries:
- "machine learning tutorial"
- "react best practices" 
- "python data science"
- "web development 2024"

Watch the **set theory optimization** in action!

## 🏆 Best Practices Implemented

✅ **Single Command Start**: `npm run dev`  
✅ **Smart Port Detection**: Automatically avoids conflicts  
✅ **Graceful Shutdown**: Ctrl+C stops all services cleanly  
✅ **Environment Detection**: Auto-detects Python virtual env  
✅ **Real-time Logging**: Separate logs for frontend/backend  
✅ **Error Handling**: Clear error messages and fallbacks  

## 🔧 Scripts Explained

| Script | Purpose | When to Use |
|--------|---------|-------------|
| `npm run dev` | **Gold Standard** - Full automation | Daily development |
| `npm run dev-concurrent` | Alternative using concurrently | If dev-start.js fails |
| `npm run start-smart` | Frontend only with port detection | Backend already running |
| `npm start` | Standard React start | Manual port control |
| `npm run backend` | Backend only | Frontend already running |

## 🚨 Troubleshooting

**Port Conflicts?**
- The system auto-detects available ports (3001, 3002, 3003...)
- Use `PORT=XXXX npm start` to force a specific port

**Python Environment?**
- Auto-detects `backend_venv/Scripts/python.exe`
- Falls back to system `python` command

**Backend Not Starting?**
- Ensure `semantic_web_mining_engine.py` exists
- Check Python dependencies are installed

## 🎉 You're Ready!

Run `npm run dev` and watch your revolutionary semantic web mining system come to life! 🧠⚡