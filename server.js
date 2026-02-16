#!/usr/bin/env node
/**
 * Custom Next.js server with Yjs WebSocket collaboration
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const Y = require('yjs');
const { encoding, decoding, map } = require('lib0');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

// Yjs message types
const messageSync = 0;
const messageAwareness = 1;
const messageAuth = 2;

// In-memory document storage
const docs = new Map();
const connsPerDoc = new Map();

/**
 * Get or create a Yjs document
 */
const getYDoc = (docname) => {
  let doc = docs.get(docname);
  if (!doc) {
    doc = new Y.Doc();
    doc.gc = true;
    docs.set(docname, doc);
    connsPerDoc.set(docname, new Set());
    console.log(`[Collab] Created document: ${docname}`);
  }
  return doc;
};

/**
 * Broadcast message to all connections for a document
 */
const broadcastToDoc = (docname, message, excludeConn = null) => {
  const conns = connsPerDoc.get(docname);
  if (conns) {
    conns.forEach((conn) => {
      if (conn !== excludeConn && conn.readyState === WebSocket.OPEN) {
        conn.send(message);
      }
    });
  }
};

/**
 * Handle Yjs sync protocol
 */
const handleMessage = (conn, docname, message) => {
  try {
    const doc = getYDoc(docname);
    const decoder = decoding.createDecoder(message);
    const messageType = decoding.readVarUint(decoder);

    switch (messageType) {
      case messageSync: {
        const syncMessageType = decoding.readVarUint(decoder);
        
        switch (syncMessageType) {
          case 0: // sync step 1
            // Send full document state
            const encoder = encoding.createEncoder();
            encoding.writeVarUint(encoder, messageSync);
            encoding.writeVarUint(encoder, 2); // sync step 2
            encoding.writeVarUint8Array(encoder, Y.encodeStateAsUpdate(doc));
            conn.send(encoding.toUint8Array(encoder));
            break;
          case 1: // sync step 2 (state)
          case 2: { // update
            const update = decoding.readVarUint8Array(decoder);
            Y.applyUpdate(doc, update, conn);
            
            // Broadcast update to other clients
            const updateEncoder = encoding.createEncoder();
            encoding.writeVarUint(updateEncoder, messageSync);
            encoding.writeVarUint(updateEncoder, 2);
            encoding.writeVarUint8Array(updateEncoder, update);
            broadcastToDoc(docname, encoding.toUint8Array(updateEncoder), conn);
            break;
          }
        }
        break;
      }
      case messageAwareness: {
        // Broadcast awareness to all clients
        broadcastToDoc(docname, message, conn);
        break;
      }
    }
  } catch (err) {
    console.error('[Collab] Error handling message:', err);
  }
};

/**
 * Send sync step 1 to initialize connection
 */
const sendSyncStep1 = (conn, doc) => {
  const encoder = encoding.createEncoder();
  encoding.writeVarUint(encoder, messageSync);
  encoding.writeVarUint(encoder, 0); // sync step 1
  encoding.writeVarUint8Array(encoder, Y.encodeStateVector(doc));
  conn.send(encoding.toUint8Array(encoder));
};

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
      
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error handling request:', err);
      res.statusCode = 500;
      res.end('Internal server error');
    }
  });

  // WebSocket server for Yjs collaboration
  const wss = new WebSocket.Server({ noServer: true });

  wss.on('connection', (ws, req, docname) => {
    console.log(`[Collab] Client connected to: ${docname}`);
    
    const doc = getYDoc(docname);
    const conns = connsPerDoc.get(docname);
    conns.add(ws);
    
    ws.binaryType = 'arraybuffer';
    
    // Send initial sync
    sendSyncStep1(ws, doc);
    
    ws.on('message', (message) => {
      const data = new Uint8Array(message);
      handleMessage(ws, docname, data);
    });
    
    ws.on('close', () => {
      console.log(`[Collab] Client disconnected from: ${docname}`);
      conns.delete(ws);
      
      // Clean up empty docs after a delay
      if (conns.size === 0) {
        setTimeout(() => {
          if (conns.size === 0) {
            docs.delete(docname);
            connsPerDoc.delete(docname);
            console.log(`[Collab] Cleaned up document: ${docname}`);
          }
        }, 30000);
      }
    });
    
    ws.on('error', (err) => {
      console.error(`[Collab] WebSocket error:`, err);
    });
  });

  // Handle upgrade requests
  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);
    
    // Handle /collab/{docname} WebSocket connections
    if (pathname && pathname.startsWith('/collab/')) {
      const docname = pathname.slice(8) || 'default'; // Remove '/collab/'
      
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req, docname);
      });
    } else {
      // Don't handle other upgrades (Next.js HMR will work differently in dev)
      socket.destroy();
    }
  });

  server.listen(port, hostname, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
    console.log(`📝 Collaboration WebSocket at ws://${hostname}:${port}/collab/{room}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});
