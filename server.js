#!/usr/bin/env node
/**
 * Next.js server with y-websocket collaboration + Convex persistence (HTTP API)
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const Y = require('yjs');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Convex HTTP API
const CONVEX_URL = 'https://abundant-meadowlark-701.convex.cloud';

// Track which docs have been loaded
const loadedDocs = new Set();
const pendingSaves = new Map();
const SAVE_DELAY = 3000;

/**
 * Call Convex function via HTTP
 */
async function convexCall(type, functionName, args) {
  try {
    const response = await fetch(`${CONVEX_URL}/api/${type}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: functionName,
        args: args,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    return data.value;
  } catch (err) {
    console.error(`[Convex] Error calling ${functionName}:`, err.message);
    return null;
  }
}

/**
 * Load document from Convex
 */
async function loadFromConvex(docName) {
  const result = await convexCall('query', 'documents:get', { name: docName });
  if (result && result.state) {
    const buffer = Buffer.from(result.state, 'base64');
    console.log(`[Convex] Loaded: ${docName} (${buffer.length} bytes)`);
    return new Uint8Array(buffer);
  }
  return null;
}

/**
 * Save document to Convex
 */
async function saveToConvex(docName, state) {
  const base64 = Buffer.from(state).toString('base64');
  await convexCall('mutation', 'documents:save', { name: docName, state: base64 });
  console.log(`[Convex] Saved: ${docName} (${state.length} bytes)`);
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
  loadedDocs.add(docName);
  
  // Wait a bit for y-websocket to create the doc
  await new Promise(r => setTimeout(r, 100));
  
  const doc = docs.get(docName);
  if (!doc) {
    console.log(`[Convex] Doc not found in y-websocket: ${docName}`);
    return;
  }
  
  // Try to load from Convex
  const savedState = await loadFromConvex(docName);
  if (savedState && savedState.length > 2) {
    Y.applyUpdate(doc, savedState);
    console.log(`[Convex] Applied state to: ${docName}`);
  }
  
  // Setup save on updates
  doc.on('update', () => {
    scheduleSave(docName);
  });
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
    initDoc(docName);
    
    ws.on('close', async () => {
      console.log(`[Collab] Disconnected: ${docName}`);
      
      // Force save on disconnect
      const doc = docs.get(docName);
      if (doc) {
        const state = Y.encodeStateAsUpdate(doc);
        if (state.length > 2) {
          await saveToConvex(docName, state);
        }
        
        // Clear loadedDocs when last client disconnects (allow re-init on next connection)
        if (doc.conns && doc.conns.size === 0) {
          loadedDocs.delete(docName);
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
    console.log(`💾 Persistence: Convex`);
  });
});
