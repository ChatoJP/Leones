import { DatabaseSync } from "node:sqlite";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const db = new DatabaseSync(join(dirname(fileURLToPath(import.meta.url)), "leones.db"));

db.exec(`
  PRAGMA journal_mode = WAL;

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reset_tokens (
    token TEXT PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    expires_at TEXT NOT NULL,
    used INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    public_id TEXT UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    guest_email TEXT,
    customer_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    notes TEXT,
    subtotal REAL NOT NULL,
    shipping REAL NOT NULL,
    total REAL NOT NULL,
    currency TEXT NOT NULL,
    payment_provider TEXT NOT NULL,
    payment_ref TEXT,
    payment_status TEXT NOT NULL DEFAULT 'pending',
    order_status TEXT NOT NULL DEFAULT 'new',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id INTEGER NOT NULL REFERENCES orders(id),
    sku TEXT NOT NULL,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL,
    image TEXT
  );

  CREATE TABLE IF NOT EXISTS newsletter (
    email TEXT PRIMARY KEY,
    lang TEXT,
    interest TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS pageviews (
    path TEXT NOT NULL,
    day TEXT NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY (path, day)
  );

  CREATE TABLE IF NOT EXISTS stock (
    sku TEXT PRIMARY KEY,
    quantity INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reward_rules (
    book TEXT PRIMARY KEY,
    reward_type TEXT NOT NULL DEFAULT 'surprise',
    reward_value TEXT,
    active INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS suppliers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    contact TEXT,
    email TEXT,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS product_costs (
    sku TEXT PRIMARY KEY,
    unit_cost REAL NOT NULL DEFAULT 0,
    supplier_id INTEGER REFERENCES suppliers(id)
  );

  CREATE TABLE IF NOT EXISTS book_confirmations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book TEXT NOT NULL,
    child_name TEXT,
    parent_email TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export default db;

// online migrations for existing databases
for (const stmt of [
  "ALTER TABLE orders ADD COLUMN carrier TEXT",
  "ALTER TABLE orders ADD COLUMN tracking TEXT",
  "ALTER TABLE orders ADD COLUMN shipped_at TEXT",
  "ALTER TABLE orders ADD COLUMN shipping_cost REAL",
]) {
  try { db.exec(stmt); } catch { /* column exists */ }
}
