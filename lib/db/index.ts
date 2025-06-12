import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'

const sqlite = new Database('photo-review.db')
export const db = drizzle(sqlite, { schema })

// Crear tablas si no existen
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS photographers (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    studio_name TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    photographer_id TEXT REFERENCES photographers(id),
    client_name TEXT NOT NULL,
    location TEXT NOT NULL,
    session_date TEXT,
    access_token TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS photos (
    id TEXT PRIMARY KEY,
    session_id TEXT REFERENCES sessions(id),
    filename TEXT NOT NULL,
    original_url TEXT NOT NULL,
    thumbnail_url TEXT,
    upload_order INTEGER,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS photo_reviews (
    id TEXT PRIMARY KEY,
    photo_id TEXT REFERENCES photos(id),
    rating INTEGER DEFAULT 3,
    color_tag TEXT,
    comment TEXT DEFAULT '',
    is_favorite INTEGER DEFAULT 0,
    is_reviewed INTEGER DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
`)

// Insertar datos de demo
const demoData = sqlite.prepare(`
  INSERT OR IGNORE INTO sessions (id, client_name, location, session_date, access_token, created_at)
  VALUES ('session-001', 'María González', 'Sesión Familiar - Parque Central', '2024-01-15', 'demo-token-123', ?)
`).run(Date.now())

// Insertar fotos de demo
for (let i = 1; i <= 48; i++) {
  sqlite.prepare(`
    INSERT OR IGNORE INTO photos (id, session_id, filename, original_url, upload_order, created_at)
    VALUES (?, 'session-001', ?, ?, ?, ?)
  `).run(`photo-${i}`, `IMG_${String(i).padStart(4, '0')}.jpg`, `/placeholder.svg?height=400&width=300`, i, Date.now())
  
  sqlite.prepare(`
    INSERT OR IGNORE INTO photo_reviews (id, photo_id, rating, color_tag, comment, is_favorite, is_reviewed, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    `review-${i}`, 
    `photo-${i}`, 
    (i % 5) + 1,
    i % 4 === 0 ? 'green' : i % 4 === 1 ? 'yellow' : i % 4 === 2 ? 'red' : null,
    i % 6 === 0 ? 'Me encanta esta foto, perfecta para imprimir' : '',
    i % 7 === 0 ? 1 : 0,
    i < 12 ? 1 : 0,
    Date.now()
  )
} 