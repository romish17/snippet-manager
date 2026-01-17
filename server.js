import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for backups

// Serve static files from the React build
app.use(express.static(join(__dirname, 'dist')));

// Database Connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'devsnippets',
};

let pool;

async function initDb() {
  try {
    pool = mysql.createPool(dbConfig);

    // Create Table if not exists
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS items (
        id VARCHAR(36) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content LONGTEXT,
        category VARCHAR(50),
        description TEXT,
        tags JSON,
        language VARCHAR(50),
        registryPath VARCHAR(512),
        registryName VARCHAR(255),
        registryType VARCHAR(50),
        createdAt BIGINT,
        updatedAt BIGINT
      )
    `;
    await pool.query(createTableQuery);

    // Migration: Add registryName column if it doesn't exist
    try {
      await pool.query(`
        ALTER TABLE items
        ADD COLUMN IF NOT EXISTS registryName VARCHAR(255) AFTER registryPath
      `);
    } catch (migrationError) {
      // Column might already exist, ignore error
      console.log('Migration note:', migrationError.message);
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Retry logic for Docker container startup timing
    setTimeout(initDb, 5000);
  }
}

initDb();

// API Routes

// GET All Items
app.get('/api/items', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });
  try {
    const [rows] = await pool.query('SELECT * FROM items ORDER BY updatedAt DESC');
    // MySQL returns JSON columns as objects automatically in newer drivers, 
    // but just in case or for consistency with simple types:
    const items = rows.map(row => ({
      ...row,
      tags: typeof row.tags === 'string' ? JSON.parse(row.tags) : row.tags
    }));
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// SYNC (Bulk Save) - Simplest strategy for this migration
// In a real app, you'd want individual CRUD, but to keep App.tsx structure, we sync state.
app.post('/api/sync', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });
  const items = req.body;
  
  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Truncate (or Delete All)
    await connection.query('DELETE FROM items');

    // 2. Insert All (if any)
    if (items.length > 0) {
      const values = items.map(item => [
        item.id,
        item.title,
        item.content,
        item.category,
        item.description || '',
        JSON.stringify(item.tags),
        item.language || null,
        item.registryPath || null,
        item.registryName || null,
        item.registryType || null,
        item.createdAt,
        item.updatedAt
      ]);

      const sql = `INSERT INTO items (id, title, content, category, description, tags, language, registryPath, registryName, registryType, createdAt, updatedAt) VALUES ?`;
      await connection.query(sql, [values]);
    }

    await connection.commit();
    res.json({ success: true, count: items.length });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ error: 'Sync failed' });
  } finally {
    connection.release();
  }
});

// Fallback for React Router
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});