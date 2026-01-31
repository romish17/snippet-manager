import express from 'express';
import mysql from 'mysql2/promise';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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

    // Create Tables if not exists
    const createItemsTableQuery = `
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
        updatedAt BIGINT,
        userId VARCHAR(36),
        FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
      )
    `;

    const createUsersTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        createdAt BIGINT,
        updatedAt BIGINT
      )
    `;

    // Create users table first (because of foreign key)
    await pool.query(createUsersTableQuery);
    await pool.query(createItemsTableQuery);

    // Migrations: Add missing columns if they don't exist
    // MySQL doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
    // So we check first if the column exists

    // Check and add registryName column
    try {
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'items' AND COLUMN_NAME = 'registryName'`,
        [dbConfig.database]
      );

      if (columns.length === 0) {
        await pool.query(`ALTER TABLE items ADD COLUMN registryName VARCHAR(255) AFTER registryPath`);
        console.log('Migration: Added registryName column');
      }
    } catch (migrationError) {
      console.log('Migration note (registryName):', migrationError.message);
    }

    // Check and add userId column
    try {
      const [columns] = await pool.query(
        `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS
         WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'items' AND COLUMN_NAME = 'userId'`,
        [dbConfig.database]
      );

      if (columns.length === 0) {
        await pool.query(`ALTER TABLE items ADD COLUMN userId VARCHAR(36)`);
        console.log('Migration: Added userId column');
      }
    } catch (migrationError) {
      console.log('Migration note (userId):', migrationError.message);
    }

    // Create default admin user if no users exist
    const [users] = await pool.query('SELECT COUNT(*) as count FROM users');
    if (users[0].count === 0) {
      const hashedPassword = await bcrypt.hash('admin', 10);
      await pool.query(
        'INSERT INTO users (id, username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
        ['default-admin-id', 'admin', 'admin@devsnippet.local', hashedPassword, 'admin', Date.now(), Date.now()]
      );
      console.log('Default admin user created: username=admin, password=admin');
    }

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    // Retry logic for Docker container startup timing
    setTimeout(initDb, 5000);
  }
}

initDb();

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Authentication Routes

// Register
app.post('/api/auth/register', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });

  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    // Check if user already exists
    const [existingUsers] = await pool.query(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [username, email]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const userId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await pool.query(
      'INSERT INTO users (id, username, email, password, role, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, username, email, hashedPassword, 'user', Date.now(), Date.now()]
    );

    // Generate token
    const token = jwt.sign(
      { id: userId, username, email, role: 'user' },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'User created successfully',
      token,
      user: { id: userId, username, email, role: 'user' }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });

  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Find user
    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      user: { id: user.id, username: user.username, email: user.email, role: user.role }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user (verify token)
app.get('/api/auth/me', authenticateToken, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });

  try {
    const [users] = await pool.query(
      'SELECT id, username, email, role, createdAt FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: users[0] });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// API Routes (Protected)

// GET All Items (for current user)
app.get('/api/items', authenticateToken, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });
  try {
    const [rows] = await pool.query(
      'SELECT * FROM items WHERE userId = ? ORDER BY updatedAt DESC',
      [req.user.id]
    );
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
app.post('/api/sync', authenticateToken, async (req, res) => {
  if (!pool) return res.status(503).json({ error: 'Database not ready' });
  const items = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ error: 'Invalid data format' });
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1. Delete all items for this user
    await connection.query('DELETE FROM items WHERE userId = ?', [req.user.id]);

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
        item.updatedAt,
        req.user.id // Associate with current user
      ]);

      const sql = `INSERT INTO items (id, title, content, category, description, tags, language, registryPath, registryName, registryType, createdAt, updatedAt, userId) VALUES ?`;
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