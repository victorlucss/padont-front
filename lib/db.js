/**
 * SQLite persistence for Yjs documents
 */

const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// Ensure data directory exists
const dataDir = process.env.DATA_DIR || path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'padont.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrent access
db.pragma('journal_mode = WAL');

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS documents (
    name TEXT PRIMARY KEY,
    state BLOB NOT NULL,
    updated_at INTEGER NOT NULL
  );
  
  CREATE TABLE IF NOT EXISTS document_meta (
    name TEXT PRIMARY KEY,
    title TEXT,
    author TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY (name) REFERENCES documents(name)
  );
`);

// Prepared statements
const getDoc = db.prepare('SELECT state FROM documents WHERE name = ?');
const upsertDoc = db.prepare(`
  INSERT INTO documents (name, state, updated_at) 
  VALUES (?, ?, ?)
  ON CONFLICT(name) DO UPDATE SET state = ?, updated_at = ?
`);
const listDocs = db.prepare('SELECT name, updated_at FROM documents ORDER BY updated_at DESC LIMIT ?');
const deleteDoc = db.prepare('DELETE FROM documents WHERE name = ?');

/**
 * Get document state from database
 * @param {string} name - Document name
 * @returns {Uint8Array|null} - Yjs state or null if not found
 */
function getDocument(name) {
  const row = getDoc.get(name);
  return row ? row.state : null;
}

/**
 * Save document state to database
 * @param {string} name - Document name
 * @param {Uint8Array} state - Yjs encoded state
 */
function saveDocument(name, state) {
  const now = Date.now();
  upsertDoc.run(name, state, now, state, now);
}

/**
 * List all documents
 * @param {number} limit - Max documents to return
 * @returns {Array} - List of {name, updated_at}
 */
function listDocuments(limit = 100) {
  return listDocs.all(limit);
}

/**
 * Delete a document
 * @param {string} name - Document name
 */
function deleteDocument(name) {
  deleteDoc.run(name);
}

/**
 * Close database connection
 */
function close() {
  db.close();
}

module.exports = {
  getDocument,
  saveDocument,
  listDocuments,
  deleteDocument,
  close,
  dbPath,
};
