#!/usr/bin/env node
/**
 * Custom Next.js server with y-websocket collaboration
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const WebSocket = require('ws');
const { setupWSConnection, docs } = require('y-websocket/bin/utils');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT, 10) || 3000;

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

  wss.on('connection', (ws, req, docName) => {
    console.log(`[Collab] Client connected to: ${docName}`);
    
    setupWSConnection(ws, req, {
      docName,
      gc: true,
    });
    
    ws.on('close', () => {
      console.log(`[Collab] Client disconnected from: ${docName}`);
    });
  });

  // Handle upgrade requests
  server.on('upgrade', (req, socket, head) => {
    const { pathname } = parse(req.url);
    
    // Handle /collab/{docname} WebSocket connections
    if (pathname && pathname.startsWith('/collab/')) {
      const docName = pathname.slice(8) || 'default';
      
      wss.handleUpgrade(req, socket, head, (ws) => {
        wss.emit('connection', ws, req, docName);
      });
    } else {
      socket.destroy();
    }
  });

  server.listen(port, hostname, () => {
    console.log(`🚀 Server ready at http://${hostname}:${port}`);
    console.log(`📝 Collaboration at ws://${hostname}:${port}/collab/{room}`);
  });
});
