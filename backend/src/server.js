import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { apiRouter } from './routes/api.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middlewares
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// API Routes
app.use('/api', apiRouter);

// Serve frontend static build if it exists (for local demo & fullstack hosting)
const frontendDistPath = path.resolve(__dirname, '../../frontend/dist');
const docsPath = path.resolve(__dirname, '../../docs');
const staticPath = fs.existsSync(frontendDistPath) ? frontendDistPath : docsPath;

if (fs.existsSync(staticPath)) {
  console.log(`[Server] Serving static frontend from: ${staticPath}`);
  app.use(express.static(staticPath));

  // SPA fallback
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(staticPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>RanTube Converter API</title>
          <style>
            body { font-family: system-ui, sans-serif; background: #0f172a; color: #f8fafc; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; }
            .card { background: #1e293b; padding: 2rem 3rem; border-radius: 1rem; border: 1px solid #334155; text-align: center; max-width: 500px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5); }
            h1 { color: #f43f5e; margin-bottom: 0.5rem; }
            p { color: #94a3b8; line-height: 1.6; }
            .badge { display: inline-block; background: #059669; color: white; padding: 0.25rem 0.75rem; border-radius: 9999px; font-size: 0.875rem; font-weight: 600; margin-top: 1rem; }
            code { background: #0f172a; padding: 0.2rem 0.4rem; border-radius: 0.25rem; color: #38bdf8; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>RanTube Converter API</h1>
            <p>Le backend Node.js est actif et prêt à convertir vos vidéos et musiques YouTube.</p>
            <div class="badge">API en ligne sur le port ${config.port}</div>
            <p style="margin-top: 1.5rem; font-size: 0.85rem;">Frontend en cours de chargement ou accessible via Vite sur le port 3000.</p>
          </div>
        </body>
      </html>
    `);
  });
}

// Start server
const server = app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`🚀 RanTube Converter API démarré sur : http://localhost:${config.port}`);
  console.log(`📡 Endpoints disponibles :`);
  console.log(`   - GET  /api/health`);
  console.log(`   - POST /api/info`);
  console.log(`   - POST /api/convert`);
  console.log(`   - GET  /api/jobs/:id`);
  console.log(`   - GET  /api/download/:id`);
  console.log(`====================================================`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[Server] Arrêt du serveur...');
  server.close(() => {
    process.exit(0);
  });
});

