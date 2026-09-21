
import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const app = express();

const root = fileURLToPath(new URL('.', import.meta.url));

const PORT = Number(process.env.PORT) || 3000;

const startedAt = Date.now();

// A real backend endpoint that returns server information.
app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    runtime: `Node ${process.version}`,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString(),
  });
});

// Serve the React production build.
app.use(express.static(path.join(root, 'dist')));

// Return the React app for all other frontend routes.
app.use((req, res) => {
  res.sendFile(path.join(root, 'dist', 'index.html'));
});

// Start the server.
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Velocity demo running on port ${PORT}`);
});
