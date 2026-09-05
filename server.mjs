import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3000;

// Serve static files from dist folder
app.use(express.static(path.join(__dirname, 'dist')));

// Handle SPA routing - serve index.html for all routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Get network IP
function getNetworkIP() {
  const interfaces = os.networkInterfaces();
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      // Skip internal and non-IPv4 addresses
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

app.listen(PORT, '0.0.0.0', () => {
  const networkIP = getNetworkIP();
  console.log(`
╔══════════════════════════════════════════════════════════╗
║   SortBench Server Running 24/7                         ║
║   Local:   http://localhost:${PORT}/                      ║
║   Network: http://${networkIP}:${PORT}/                     ║
║                                                          ║
║   Server will run even if VS Code is closed             ║
╚══════════════════════════════════════════════════════════╝
  `);
});
