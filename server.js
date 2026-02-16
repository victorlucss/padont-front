#!/usr/bin/env node
/**
 * Next.js server with y-websocket collaboration + Convex persistence
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');
const { ConvexHttpClient } = require('convex/browser');
const { api } = require('./convex/_generated/api');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Convex client
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://abundant-meadowlark-701.convex.cloud';
const convex = new ConvexHttpClient(CONVEX_URL);

// Track which docs have been loaded from Convex
const loadedDocs = new Set();
const pendingSaves = new Map();
const SAVE_DELAY = 3000; // Save 3 seconds after last change

/**
 * Load document from Convex
 */
async function loadFromConvex(docName) {
  try {
    const result = await convex.query(api.documents.get, { name: docName });
    if (result && result.state) {
      // Decode base64 to Uint8Array
      const buffer = Buffer.from(result.state, 'base64');
      console.log(`[Convex] Loaded: ${docName} (${buffer.length} bytes)`);
      return new Uint8Array(buffer);
    }
  } catch (err) {
    console.error(`[Convex] Error loading ${docName}:`, err.message);
  }
  return null;
}

/**
 * Save document to Convex
 */
async function saveToConvex(docName, state) {
  try {
    // Encode Uint8Array to base64
    const base64 = Buffer.from(state).toString('base64');
    await convex.mutation(api.documents.save, { name: docName, state: base64 });
    console.log(`[Convex] Saved: ${docName} (${state.length} bytes)`);
  } catch (err) {
    console.error(`[Convex] Error saving ${docName}:`, err.message);
  }
}

/**
 * Schedule a save (debounced)
 */
function scheduleSave(docName) {
  if (pendingSaves.has(docName)) {
    clearTimeout(pendingSaves.get(docName));
  }
  
  pendingSaves.set(docName, setTimeout(async () => {
    const doc = docs.get(docName);
    if (doc) {
      const state = Y.encodeStateAsUpdate(doc);
      if (state.length > 2) {
        await saveToConvex(docName, state);
      }
    }
    pendingSaves.delete(docName);
  }, SAVE_DELAY));
}

/**
 * Initialize document with Convex data
 */
async function initDoc(docName) {
  if (loadedDocs.has(docName)) return;
  
  const doc = docs.get(docName);
  if (!doc) return;
  
  // Try to load from Convex
  const savedState = await loadFromConvex(docName);
  if (savedState && savedState.length > 2) {
    Y.applyUpdate(doc, savedState);
  }
  
  // Setup save on updates
  doc.on('update', () => {
    scheduleSave(docName);
  });
  
  loadedDocs.add(docName);
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
          persistence: 'convex',
          timestamp: new Date().toISOString()
        }));
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

  wss.on('connection', async (ws, req, docName) => {
    console.log(`[Collab] Connected: ${docName}`);
    
    // Setup y-websocket first
    setupWSConnection(ws, req, { docName, gc: true });
    
    // Then init from Convex (async)
    await initDoc(docName);
    
    ws.on('close', async () => {
      console.log(`[Collab] Disconnected: ${docName}`);
      
      // Force save on disconnect
      const doc = docs.get(docName);
      if (doc) {
        const state = Y.encodeStateAsUpdate(doc);
        if (state.length > 2) {
          await saveToConvex(docName, state);
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

  // Periodic save every 30 seconds
  setInterval(() => {
    docs.forEach(async (doc, docName) => {
      const state = Y.encodeStateAsUpdate(doc);
      if (state.length > 2) {
        await saveToConvex(docName, state);
      }
    });
  }, 30000);

  server.listen(port, hostname, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
    console.log(`📝 Collab: ws://${hostname}:${port}/collab/{room}`);
    console.log(`💾 Persistence: Convex (${CONVEX_URL})`);
  });
});
