import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'reviews.db');
let db;
export function getDb() {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    db.exec(`
      CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT NOT NULL, password_hash TEXT NOT NULL, stripe_customer_id TEXT, subscription_status TEXT DEFAULT 'inactive', subscription_id TEXT, created_at TEXT DEFAULT (datetime('now')));
      CREATE TABLE IF NOT EXISTS campaigns (id TEXT PRIMARY KEY, user_id TEXT NOT NULL, name TEXT NOT NULL, widget_type TEXT DEFAULT 'review' CHECK(widget_type IN ('review','nps')), prompt_text TEXT DEFAULT 'How was your experience?', accent_color TEXT DEFAULT '#6366f1', position TEXT DEFAULT 'bottom-right' CHECK(position IN ('bottom-right','bottom-left','top-right','top-left')), show_stars INTEGER DEFAULT 1, created_at TEXT DEFAULT (datetime('now')), updated_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (user_id) REFERENCES users(id));
      CREATE TABLE IF NOT EXISTS responses (id TEXT PRIMARY KEY, campaign_id TEXT NOT NULL, rating INTEGER, review_text TEXT DEFAULT '', nps_score INTEGER, respondent_name TEXT DEFAULT '', respondent_email TEXT DEFAULT '', approved INTEGER DEFAULT 0, created_at TEXT DEFAULT (datetime('now')), FOREIGN KEY (campaign_id) REFERENCES campaigns(id) ON DELETE CASCADE);
    `);
  }
  return db;
}