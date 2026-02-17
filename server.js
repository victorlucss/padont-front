#!/usr/bin/env node
/**
 * Next.js server with HocusPocus collaboration + Convex persistence
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const { Hocuspocus } = require('@hocuspocus/server');
const { Database } = require('@hocuspocus/extension-database');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Convex HTTP API
const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || 'https://abundant-meadowlark-701.convex.cloud';

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
 * Load document from Convex (returns Uint8Array or null)
 */
async function loadFromConvex(docName) {
  const result = await convexCall('query', 'documents:get', { name: docName });
  if (result && result.state) {
    const buffer = Buffer.from(result.state, 'base64');
    console.log(`[Convex] Loaded: ${docName} (${buffer.length} bytes)`);
    return new Uint8Array(buffer);
  }
  console.log(`[Convex] No existing document: ${docName}`);
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

// Configure HocusPocus server (don't call listen - we'll use handleConnection)
const hocuspocus = new Hocuspocus({
  // Debounce saves - HocusPocus handles this better than our manual implementation
  debounce: 3000,
  // Max debounce wait time
  maxDebounce: 10000,
  
  extensions: [
    new Database({
      // Fetch document state from Convex
      fetch: async ({ documentName }) => {
        return await loadFromConvex(documentName);
      },
      // Store document state to Convex
      store: async ({ documentName, state }) => {
        // Only save if there's actual content (state > 2 bytes)
        if (state && state.length > 2) {
          await saveToConvex(documentName, state);
        }
      },
    }),
  ],
  
  // Optional: Add hooks for logging/monitoring
  async onConnect({ documentName, requestHeaders }) {
    console.log(`[HocusPocus] Client connecting to: ${documentName}`);
  },
  
  async onDisconnect({ documentName, clientsCount }) {
    console.log(`[HocusPocus] Client disconnected from: ${documentName} (${clientsCount} remaining)`);
  },
  
  async onStoreDocument({ documentName }) {
    console.log(`[HocusPocus] Document stored: ${documentName}`);
  },
});

// Create WebSocket server for upgrade handling (noServer mode)
const wss = new WebSocket.Server({ noServer: true });

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
          rooms: hocuspocus.getDocumentsCount(),
          connections: hocuspocus.getConnectionsCount(),
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

  // Handle WebSocket upgrades
  server.on('upgrade', (request, socket, head) => {
    const { pathname } = parse(request.url);
    
    // Match /collab/{room} pattern
    if (pathname && pathname.startsWith('/collab/')) {
      const documentName = pathname.slice(8) || 'default';
      
      // IMPORTANT: Use wss.handleUpgrade to create the WebSocket,
      // then pass it to hocuspocus.handleConnection (NOT handleUpgrade!)
      wss.handleUpgrade(request, socket, head, (ws) => {
        // Pass the WebSocket, request, and context to HocusPocus
        hocuspocus.handleConnection(ws, request, { documentName });
      });
    } else {
      // Not a collab request - destroy the socket
      socket.destroy();
    }
  });

  server.listen(port, hostname, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
    console.log(`📝 Collab: ws://${hostname}:${port}/collab/{room}`);
    console.log(`💾 Persistence: Convex (via @hocuspocus/extension-database)`);
  });
});
