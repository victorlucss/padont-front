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

// Track documents that need saving (debounce)
const pendingSaves = new Map();
const SAVE_DELAY = 2000; // Save 2 seconds after last change

/**
 * Load document from SQLite if exists
 */
function loadDocFromDB(docName) {
  const state = getDocument(docName);
  if (state) {
    console.log(`[DB] Loaded document: ${docName} (${state.length} bytes)`);
    return state;
  }
  return null;
}

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
      saveDocument(docName, state);
      console.log(`[DB] Saved document: ${docName} (${state.length} bytes)`);
    }
    pendingSaves.delete(docName);
  }, SAVE_DELAY));
}

/**
 * Get or create a Yjs document with persistence
 */
function getYDoc(docName) {
  let doc = docs.get(docName);
  
  if (!doc) {
    doc = new Y.Doc();
    doc.gc = true;
    
    // Load from database if exists
    const savedState = loadDocFromDB(docName);
    if (savedState) {
      Y.applyUpdate(doc, savedState);
    }
    
    // Listen for updates to schedule saves
    doc.on('update', () => {
      scheduleSave(docName);
    });
    
    docs.set(docName, doc);
    console.log(`[Collab] Created document: ${docName}${savedState ? ' (restored from DB)' : ''}`);
  }
  
  return doc;
}

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      
      // Health check endpoint
      if (parsedUrl.pathname === '/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
          status: 'ok', 
          rooms: docs.size,
          timestamp: new Date().toISOString()
        }));
        return;
      }
      
      // List documents endpoint
      if (parsedUrl.pathname === '/api/documents') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(listDocuments(100)));
        return;
      }
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // WebSocket server for Yjs collaboration
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws, req, docName) => {
    console.log(`[Collab] Client connected to: ${docName}`);
    
    // Ensure document is loaded from DB before connection
    getYDoc(docName);
    
    setupWSConnection(ws, req, {
      docName,
      gc: true,
    });
    
    ws.on('close', () => {
      console.log(`[Collab] Client disconnected from: ${docName}`);
      
      // Force save on disconnect
      const doc = docs.get(docName);
      if (doc) {
        const state = Y.encodeStateAsUpdate(doc);
        saveDocument(docName, state);
        console.log(`[DB] Saved on disconnect: ${docName}`);
      }
    });
  });

  // Handle upgrade requests
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

  // Graceful shutdown - save all pending documents
  const shutdown = () => {
    console.log('\n[Server] Shutting down...');
    
    // Save all documents
    docs.forEach((doc, docName) => {
      const state = Y.encodeStateAsUpdate(doc);
      saveDocument(docName, state);
      console.log(`[DB] Final save: ${docName}`);
    });
    
    process.exit(0);
  };
  
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  server.listen(port, hostname, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
    console.log(`📝 Collaboration at ws://${hostname}:${port}/collab/{room}`);
    console.log(`💾 SQLite persistence enabled`);
  });
});
