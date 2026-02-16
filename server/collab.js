#!/usr/bin/env node
/**
 * Collaboration WebSocket Server
 * Uses y-websocket for Yjs document synchronization
 */

const WebSocket = require('ws');
const http = require('http');
const { setupWSConnection } = require('y-websocket/bin/utils');

const PORT = process.env.COLLAB_PORT || 1234;

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Padont Collaboration Server');
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws, req) => {
  // Extract room name from URL path
  const roomName = req.url.slice(1) || 'default';
  
  console.log(`[${new Date().toISOString()}] Client connected to room: ${roomName}`);
  
  setupWSConnection(ws, req, {
    docName: roomName,
    gc: true, // Enable garbage collection
  });
  
  ws.on('close', () => {
    console.log(`[${new Date().toISOString()}] Client disconnected from room: ${roomName}`);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Collaboration server running on ws://localhost:${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down...');
  wss.close(() => {
    server.close(() => {
      process.exit(0);
    });
  });
});
