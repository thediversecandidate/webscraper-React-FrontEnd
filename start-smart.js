const { execSync } = require('child_process');
const net = require('net');

async function findAvailablePort(startPort = 3001, endPort = 3020) {
  for (let port = startPort; port <= endPort; port++) {
    if (await isPortAvailable(port)) {
      // Double-check by trying to bind again
      const doubleCheck = await isPortAvailable(port);
      if (doubleCheck) {
        return port;
      }
    }
  }
  throw new Error(`No available ports found between ${startPort} and ${endPort}`);
}

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on('error', () => resolve(false));
  });
}

async function startReactApp() {
  try {
    console.log('🔍 Searching for available port...');
    const port = await findAvailablePort();
    console.log(`✅ Found available port: ${port}`);
    
    // Set the PORT environment variable and start React
    process.env.PORT = port;
    console.log(`🚀 Starting React app on port ${port}...`);
    
    execSync('react-app-rewired start', { 
      stdio: 'inherit',
      env: { ...process.env, PORT: port }
    });
  } catch (error) {
    console.error('❌ Error starting React app:', error.message);
    process.exit(1);
  }
}

startReactApp();