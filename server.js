
import express from 'express';
import pg from 'pg';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const { Pool } = pg;

const app = express();

const root = fileURLToPath(new URL('.', import.meta.url));

const PORT = Number(process.env.PORT) || 3000;

const startedAt = Date.now();

// Parse incoming JSON requests.
app.use(express.json({ limit: '16kb' }));

// ------------------------------------
// POSTGRESQL CONNECTION
// ------------------------------------

// These values come from Cloudways environment variables.
// Never hardcode database passwords in your source code.

const pool = new Pool({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,

  // Keep the connection pool small for this demo.
  max: 5,
  connectionTimeoutMillis: 5000,
  idleTimeoutMillis: 30000
});

pool.on('error', (error) => {
  console.error('PostgreSQL idle connection error:', error.message);
});

// Return a generic error without exposing database credentials.
function databaseError(res, error) {
  console.error('Database request failed:', error.message);

  return res.status(500).json({
    error: 'Database request failed. Check the server logs.'
  });
}

// ------------------------------------
// APPLICATION STATUS
// ------------------------------------

app.get('/api/status', (req, res) => {
  res.json({
    status: 'online',
    runtime: `Node ${process.version}`,
    uptime: Math.floor((Date.now() - startedAt) / 1000),
    environment: process.env.NODE_ENV || 'production',
    timestamp: new Date().toISOString()
  });
});

// ------------------------------------
// DATABASE HEALTH CHECK
// ------------------------------------

app.get('/api/db-health', async (req, res) => {
  try {
    await pool.query('SELECT 1');

    res.json({
      status: 'connected',
      database: 'PostgreSQL',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database health check failed:', error.message);

    res.status(503).json({
      status: 'disconnected',
      database: 'PostgreSQL'
    });
  }
});

// ------------------------------------
// GET ALL TASKS
// ------------------------------------

app.get('/api/tasks', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id::text AS id, text, done, created_at
      FROM tasks
      ORDER BY created_at DESC, id DESC
    `);

    res.json(result.rows);
  } catch (error) {
    databaseError(res, error);
  }
});

// ------------------------------------
// CREATE A TASK
// ------------------------------------

app.post('/api/tasks', async (req, res) => {
  const text = req.body?.text;

  if (
    typeof text !== 'string' ||
    text.trim().length === 0 ||
    text.trim().length > 200
  ) {
    return res.status(400).json({
      error: 'Task text must contain 1 to 200 characters.'
    });
  }

  try {
    const result = await pool.query(
      `
      INSERT INTO tasks (text, done)
      VALUES ($1, FALSE)
      RETURNING id::text AS id, text, done, created_at
      `,
      [text.trim()]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    databaseError(res, error);
  }
});

// ------------------------------------
// UPDATE TASK COMPLETION
// ------------------------------------

app.patch('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;
  const { done } = req.body || {};

  if (!/^\d+$/.test(id) || typeof done !== 'boolean') {
    return res.status(400).json({
      error: 'A valid task ID and completion status are required.'
    });
  }

  try {
    const result = await pool.query(
      `
      UPDATE tasks
      SET done = $1
      WHERE id = $2
      RETURNING id::text AS id, text, done, created_at
      `,
      [done, id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found.'
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    databaseError(res, error);
  }
});

// ------------------------------------
// DELETE A TASK
// ------------------------------------

app.delete('/api/tasks/:id', async (req, res) => {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    return res.status(400).json({
      error: 'Invalid task ID.'
    });
  }

  try {
    const result = await pool.query(
      'DELETE FROM tasks WHERE id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        error: 'Task not found.'
      });
    }

    res.status(204).end();
  } catch (error) {
    databaseError(res, error);
  }
});

// Return JSON for unknown API routes.
app.use('/api', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found.'
  });
});

// ------------------------------------
// SERVE THE REACT APPLICATION
// ------------------------------------

app.use(express.static(path.join(root, 'dist')));

app.use((req, res) => {
  res.sendFile(path.join(root, 'dist', 'index.html'));
});

// ------------------------------------
// START SERVER
// ------------------------------------

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Velocity demo running on port ${PORT}`);
});
