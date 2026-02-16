#!/usr/bin/env node
/**
 * Custom Next.js server with y-websocket collaboration + SQLite persistence
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');
const { getDocument, saveDocument, listDocuments } = require('./lib/db');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Track save timeouts and initialized docs
const pendingSaves = new Map();
const initializedDocs = new Set();
const SAVE_DELAY = 2000;

/**
 * Schedule a save for a document (debounced)
 */
function scheduleSave(docName) {
  if (pendingSaves.has(docName)) {
    clearTimeout(pendingSaves.get(docName));
  }
  
  pendingSaves.set(docName, setTimeout(() => {
    const doc = docs.get(docName);
    if (doc) {
      const state = Y.encodeStateAsUpdate(doc);
      if (state.length > 2) { // Only save non-empty docs
        saveDocument(docName, state);
        console.log(`[DB] Saved: ${docName} (${state.length} bytes)`);
      }
    }
    pendingSaves.delete(docName);
  }, SAVE_DELAY));
}

/**
 * Get or create a document with persistence
 * This runs BEFORE y-websocket sees the connection
 */
function ensureDoc(docName) {
  let doc = docs.get(docName);
  
  if (!doc) {
    // Create new Yjs document
    doc = new Y.Doc();
    doc.gc = true;
    
    // Load from database FIRST
    const savedState = getDocument(docName);
    if (savedState && savedState.length > 2) {
      Y.applyUpdate(doc, savedState);
      console.log(`[DB] Loaded: ${docName} (${savedState.length} bytes)`);
    }
    
    // Register in y-websocket's docs map
    docs.set(docName, doc);
    
    // Setup persistence on updates
    doc.on('update', () => scheduleSave(docName));
    
    initializedDocs.add(docName);
  }
  
  return doc;
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          rooms: docs.size,
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      if (parsedUrl.pathname === '/api/documents') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(listDocuments(100)));
        return;
      }
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws, req, docName) => {
    console.log(`[Collab] Connected: ${docName}`);
    
    // Ensure doc exists with persisted data BEFORE y-websocket
    ensureDoc(docName);
    
    // Now let y-websocket handle sync
    setupWSConnection(ws, req, { docName, gc: true });
    
    ws.on('close', () => {
      console.log(`[Collab] Disconnected: ${docName}`);
      
      // Save on disconnect
      const doc = docs.get(docName);
      if (doc) {
        const state = Y.encodeStateAsUpdate(doc);
        if (state.length > 2) {
          saveDocument(docName, state);
          console.log(`[DB] Saved on close: ${docName}`);
        }
      }
    });
  });

  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);
    
    if (pathname && pathname.startsWith('/collab/')) {
      const docName = pathname.slice(8) || 'default';
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req, docName);
      });
    } else {
      socket.destroy();
    }
  });

  const shutdown = () => {
    console.log('\n[Server] Shutting down...');
    docs.forEach((doc, docName) => {
      const state = Y.encodeStateAsUpdate(doc);
      if (state.length > 2) {
        saveDocument(docName, state);
        console.log(`[DB] Final save: ${docName}`);
      }
    });
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(port, hostname, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
    console.log(`📝 Collab: ws://${hostname}:${port}/collab/{room}`);
    console.log(`💾 SQLite: ${require('./lib/db').dbPath}`);
  });
});
