import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

async function createServer() {
  const app = express();
  app.use(express.json());

  const MASTER_KEY = process.env.MASTER_AUTHORIZATION_KEY || 'MR-PARFUM-2026-KEY';

  // API Route to verify Master Authorization Key securely
  app.post('/api/verify-master-key', (req, res) => {
    const { key } = req.body;
    if (key === MASTER_KEY) {
      res.json({ success: true });
    } else {
      res.status(401).json({ success: false, message: 'Invalid key' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
  });
}

createServer();
