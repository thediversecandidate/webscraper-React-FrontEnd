#!/usr/bin/env node

const { spawn, execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('🚀 WEBSCRAPER FULL-STACK DEVELOPMENT ENVIRONMENT');
console.log('================================================');
console.log('🧠 Revolutionary Semantic Web Mining Engine + React Frontend');
console.log('');

// Check if Python backend exists
const backendPath = path.join(__dirname, 'semantic_web_mining_engine.py');
if (!fs.existsSync(backendPath)) {
  console.error('❌ Backend not found:', backendPath);
  console.log('💡 Make sure semantic_web_mining_engine.py exists in the project root');
  process.exit(1);
}

// Check if virtual environment exists
const venvPath = path.join(__dirname, 'backend_venv', 'Scripts', 'python.exe');
const pythonCmd = fs.existsSync(venvPath) ? venvPath : 'python';

// Quick dependency probe to help users install Python deps if missing
function probePythonDeps() {
  try {
    execSync(`${pythonCmd} -c "import requests, bs4, nltk"`, { stdio: 'ignore' });
    return true;
  } catch {
    console.log('⚠️  Python dependencies missing (requests, beautifulsoup4, nltk).');
    console.log('   Install with:');
    console.log('   pip install -r requirements.txt');
    return false;
  }
}

const depsOk = probePythonDeps();

console.log('🔧 Starting services...');
console.log('');

// Start backend with proper Windows path handling
console.log('🐍 Starting Semantic Web Mining Engine (port 8080)...');
console.log(`Debug: Using Python at: ${pythonCmd}`);

const backend = spawn(pythonCmd, ['semantic_web_mining_engine.py'], {
  cwd: __dirname,
  stdio: ['pipe', 'pipe', 'pipe'],
  env: { ...process.env, PYTHONIOENCODING: 'utf-8' }
});

let backendStarted = false;

backend.stdout.on('data', (data) => {
  const output = data.toString().trim();
  console.log(`[BACKEND] ${output}`);
  
  // Check if backend actually started
  if (output.includes('http://localhost:8080') || output.toLowerCase().includes('health') || output.toLowerCase().includes('serving')) {
    backendStarted = true;
    console.log('✅ Backend confirmed running on port 8080');
  }
});

backend.stderr.on('data', (data) => {
  const error = data.toString().trim();
  console.log(`[BACKEND ERROR] ${error}`);
});

backend.on('error', (error) => {
  console.error(`[BACKEND PROCESS ERROR] ${error.message}`);
});

// Give backend time to start and validate it's working
setTimeout(async () => {
  console.log('🔍 Validating backend is responding...');
  
  try {
    const http = require('http');
    
    const testBackend = () => new Promise((resolve, reject) => {
      const req = http.get('http://localhost:8080/health', (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          console.log('✅ Backend health check passed');
          console.log(`[BACKEND RESPONSE] ${data}`);
          resolve(data);
        });
      });
      req.on('error', reject);
      req.setTimeout(3000, () => reject(new Error('Backend health check timeout')));
    });
    
    await testBackend();
    console.log('🎯 Backend validated - starting frontend...');
    
  } catch (error) {
    console.error('❌ Backend validation failed:', error.message);
    console.error('🚨 Frontend will start anyway, but searches may not work until backend is healthy');
    if (!depsOk) {
      console.error('🛠️  Action needed: run "pip install -r requirements.txt" to install backend dependencies.');
    }
  }
  
  console.log('⚛️  Starting React Frontend (smart port detection)...');
  
  // Start frontend with smart port detection
  const frontend = spawn('npm', ['run', 'start-smart'], {
    cwd: __dirname,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: true
  });

  frontend.stdout.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.stderr.on('data', (data) => {
    console.log(`[FRONTEND] ${data.toString().trim()}`);
  });

  frontend.on('close', (code) => {
    console.log(`[FRONTEND] Process exited with code ${code}`);
    backend.kill();
    process.exit(code);
  });

}, 3000);

// Do NOT exit the whole dev process if backend exits; keep frontend running
backend.on('close', (code) => {
  console.log(`[BACKEND] Process exited with code ${code}`);
  if (code !== 0) {
    console.log('⚠️  Backend stopped. Frontend will keep running. You can restart backend separately.');
  }
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down services...');
  backend.kill();
  process.exit(0);
});

console.log('');
console.log('🎯 DEVELOPMENT SERVERS STARTING...');
console.log('📡 Backend API: http://localhost:8080');
console.log('⚛️  Frontend: Auto-detected available port');
console.log('');
console.log('🔥 Ready to test revolutionary semantic web mining!');
console.log('Press Ctrl+C to stop all services');