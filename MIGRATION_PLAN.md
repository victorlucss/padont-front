# Migration Plan: y-websocket → HocusPocus

> ## ✅ REVIEW STATUS: APPROVED (with corrections)
> **Reviewed:** 2026-02-17  
> **Reviewer:** Subagent (hocuspocus-plan-review)
> 
> **Key correction made:** Original plan used `hocuspocus.handleUpgrade()` which doesn't exist. 
> Fixed to use `wss.handleUpgrade()` + `hocuspocus.handleConnection()` pattern per official docs.
> 
> **Ready for execution** after this correction.

---

## Executive Summary

Migrate Padont's collaborative editor from `y-websocket` to `@hocuspocus/server` + `@hocuspocus/provider` to fix reconnection loop issues and gain better connection handling, built-in auth hooks, and cleaner persistence integration.

**Estimated Total Time:** 2-4 hours
**Risk Level:** Medium (well-documented migration path, but touches critical collaboration code)

---

## Current Architecture

```
┌──────────────────┐     WebSocket      ┌──────────────────┐
│  CollaborativeEditor  │ ────────────► │    server.js     │
│  (y-websocket client) │               │  (y-websocket)   │
└──────────────────┘                    └────────┬─────────┘
                                                 │ HTTP API
                                                 ▼
                                        ┌──────────────────┐
                                        │     Convex       │
                                        │  (documents:*)   │
                                        └──────────────────┘
```

**Files involved:**
- `/tmp/padont/server.js` - Custom Next.js server with y-websocket
- `/tmp/padont/components/CollaborativeEditor/index.js` - Tiptap + y-websocket client
- `/tmp/padont/convex/documents.ts` - Convex persistence functions
- `/tmp/padont/Dockerfile` - Docker build config

---

## Target Architecture

```
┌──────────────────┐     WebSocket      ┌──────────────────┐
│  CollaborativeEditor  │ ────────────► │    server.js     │
│  (HocuspocusProvider) │               │ (@hocuspocus/server) │
└──────────────────┘                    └────────┬─────────┘
                                                 │ Database Extension
                                                 ▼
                                        ┌──────────────────┐
                                        │     Convex       │
                                        │  (documents:*)   │
                                        └──────────────────┘
```

---

## Step-by-Step Migration

### Step 1: Package Changes

**Complexity:** Simple ⭐
**Risk:** Low
**Time:** 5 minutes

#### Remove:
```bash
npm uninstall y-websocket
```

#### Add:
```bash
npm install @hocuspocus/server @hocuspocus/extension-database @hocuspocus/provider
```

#### Keep (no changes):
- `yjs` - Still used by HocusPocus
- `y-prosemirror` - Still used for cursor plugin
- `@tiptap/extension-collaboration` - Works with HocusPocus
- `convex` - Persistence layer unchanged

#### package.json diff:
```diff
  "dependencies": {
+   "@hocuspocus/extension-database": "^3.4.4",
+   "@hocuspocus/provider": "^3.4.4",
+   "@hocuspocus/server": "^3.4.4",
    "@tiptap/extension-collaboration": "^3.19.0",
-   "y-websocket": "^1.5.4",
    "yjs": "^13.6.29"
  }
```

---

### Step 2: Server-Side Migration (server.js)

**Complexity:** Medium ⭐⭐
**Risk:** Medium
**Time:** 30-45 minutes

#### Replace server.js with:

```javascript
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
```

#### Key Changes:
1. **Import HocusPocus instead of y-websocket utilities**
2. **Use Database extension** for clean persistence instead of manual hooks
3. **Use `handleConnection`** method (NOT `handleUpgrade`!) to integrate with existing HTTP server
   - Create a `ws.Server({ noServer: true })` to handle upgrades
   - Call `wss.handleUpgrade()` to create the WebSocket
   - Then pass the socket to `hocuspocus.handleConnection(ws, request, context)`
4. **Built-in debouncing** - HocusPocus handles save debouncing automatically
5. **Better connection tracking** - `getDocumentsCount()` and `getConnectionsCount()`
6. **No more manual doc tracking** - HocusPocus manages document lifecycle

> ⚠️ **CRITICAL**: HocusPocus does NOT have a `handleUpgrade` method! The examples in their docs show using `handleConnection()` with an already-established WebSocket. This is a common mistake when migrating from y-websocket.

---

### Step 3: Client-Side Migration (CollaborativeEditor)

**Complexity:** Medium ⭐⭐
**Risk:** Medium
**Time:** 30-45 minutes

#### Replace the CollaborativeEditor/index.js with:

```javascript
import { useEffect, useState, useRef } from 'react';
import { useEditor, EditorContent as TiptapContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Collaboration from '@tiptap/extension-collaboration';
import { common, createLowlight } from 'lowlight';
import * as Y from 'yjs';
import { HocuspocusProvider } from '@hocuspocus/provider';
import { yCursorPlugin } from 'y-prosemirror';
import { Extension } from '@tiptap/core';

import {
  EditorContainer,
  Toolbar,
  ToolbarDivider,
  ToolbarButton,
  EditorContent,
  CollabStatus,
  CollabDot,
  CollabUsers,
  UserBadge,
} from './styles';

const lowlight = createLowlight(common);

const getRandomColor = () => {
  const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9', '#E4FF1A', '#FF69B4', '#00CED1', '#FF8C00', '#9370DB'];
  return colors[Math.floor(Math.random() * colors.length)];
};

const getRandomName = () => {
  const adjectives = ['Swift', 'Clever', 'Bold', 'Quiet', 'Bright', 'Wild', 'Cosmic', 'Lucky', 'Mystic', 'Noble'];
  const nouns = ['Fox', 'Owl', 'Bear', 'Wolf', 'Hawk', 'Tiger', 'Dragon', 'Phoenix', 'Raven', 'Lynx'];
  return `${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
};

// Custom cursor extension using y-prosemirror directly
const createCursorExtension = (provider, user) => {
  return Extension.create({
    name: 'collaborationCursor',
    
    addProseMirrorPlugins() {
      const awareness = provider.awareness;
      
      // Set user info in awareness
      awareness.setLocalStateField('user', user);
      
      return [
        yCursorPlugin(awareness, {
          cursorBuilder: (cursorUser) => {
            const cursor = document.createElement('span');
            cursor.classList.add('collaboration-cursor__caret');
            cursor.style.borderColor = cursorUser.color;
            
            const label = document.createElement('div');
            label.classList.add('collaboration-cursor__label');
            label.style.backgroundColor = cursorUser.color;
            label.textContent = cursorUser.name;
            cursor.appendChild(label);
            
            return cursor;
          },
        }),
      ];
    },
  });
};

const icons = {
  bold: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" /></svg>,
  italic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="4" x2="10" y2="4" /><line x1="14" y1="20" x2="5" y2="20" /><line x1="15" y1="4" x2="9" y2="20" /></svg>,
  strike: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.3 4.9c-2.3-.6-4.4-1-6.2-.9-2.7 0-5.3.7-5.3 3.6 0 1.5 1.8 3.3 3.6 3.9h.2" /><path d="M8.6 15c.6 1.8 3.3 4.2 8.2 3.1" /><line x1="4" y1="12" x2="20" y2="12" /></svg>,
  code: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>,
  h1: <svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="17" fontSize="14" fontWeight="bold">H1</text></svg>,
  h2: <svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="17" fontSize="14" fontWeight="bold">H2</text></svg>,
  h3: <svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="17" fontSize="14" fontWeight="bold">H3</text></svg>,
  bulletList: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="9" y1="6" x2="20" y2="6" /><line x1="9" y1="12" x2="20" y2="12" /><line x1="9" y1="18" x2="20" y2="18" /><circle cx="4" cy="6" r="1" fill="currentColor" /><circle cx="4" cy="12" r="1" fill="currentColor" /><circle cx="4" cy="18" r="1" fill="currentColor" /></svg>,
  orderedList: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="10" y1="6" x2="21" y2="6" /><line x1="10" y1="12" x2="21" y2="12" /><line x1="10" y1="18" x2="21" y2="18" /><text x="3" y="8" fontSize="8" fill="currentColor" stroke="none">1</text><text x="3" y="14" fontSize="8" fill="currentColor" stroke="none">2</text><text x="3" y="20" fontSize="8" fill="currentColor" stroke="none">3</text></svg>,
  codeBlock: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M8 10l-2 2 2 2" /><path d="M16 10l2 2-2 2" /></svg>,
  quote: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10 8c-1.105 0-2 .672-2 1.5S8.895 11 10 11c1.104 0 2-.672 2-1.5 0-.188-.054-.363-.146-.52L14 6H11L9 9h1c0-.553.448-1 1-1zm6 0c-1.105 0-2 .672-2 1.5S14.895 11 16 11c1.104 0 2-.672 2-1.5 0-.188-.054-.363-.146-.52L20 6h-3l-2 3h1c0-.553.448-1 1-1z" /></svg>,
  table: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="3" y1="15" x2="21" y2="15" /><line x1="9" y1="3" x2="9" y2="21" /><line x1="15" y1="3" x2="15" y2="21" /></svg>,
  hr: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="2" y1="12" x2="22" y2="12" /></svg>,
};

// Inner component - only mounted when collab is ready
function TiptapEditor({ collab, placeholder }) {
  const [status, setStatus] = useState('connecting');
  const [users, setUsers] = useState([]);
  
  const { ydoc, provider, user } = collab;

  // Setup event listeners for HocuspocusProvider
  useEffect(() => {
    // HocuspocusProvider uses different event names
    const handleStatus = ({ status: s }) => {
      console.log('[Collab] Status:', s);
      setStatus(s);
    };

    const handleAwareness = ({ states }) => {
      // HocuspocusProvider gives us states directly in onAwarenessChange
      const list = states
        .filter(state => state.user && state.clientId !== ydoc.clientID)
        .map(state => state.user);
      setUsers(list);
    };

    // HocuspocusProvider event names
    provider.on('status', handleStatus);
    provider.on('awarenessChange', handleAwareness);
    
    // Initial status check
    if (provider.isConnected) {
      setStatus('connected');
    }

    return () => {
      provider.off('status', handleStatus);
      provider.off('awarenessChange', handleAwareness);
    };
  }, [provider, ydoc]);

  // Create extensions array once
  const extensions = [
    StarterKit.configure({ codeBlock: false, history: false }),
    Placeholder.configure({ placeholder }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    CodeBlockLowlight.configure({ lowlight }),
    Collaboration.configure({ document: ydoc }),
    // Cursor extension (can enable later if needed)
    // createCursorExtension(provider, user),
  ];

  const editor = useEditor({
    extensions,
    editorProps: { attributes: { spellcheck: 'false' } },
  });

  if (!editor) return <div style={{ padding: 24, color: '#666' }}>Loading editor...</div>;

  const addTable = () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  const statusText = { connecting: 'Connecting...', connected: 'Live', disconnected: 'Offline' };

  return (
    <>
      <Toolbar>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} $active={editor.isActive('heading', { level: 1 })} title="H1">{icons.h1}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} $active={editor.isActive('heading', { level: 2 })} title="H2">{icons.h2}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} $active={editor.isActive('heading', { level: 3 })} title="H3">{icons.h3}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} $active={editor.isActive('bold')} title="Bold">{icons.bold}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} $active={editor.isActive('italic')} title="Italic">{icons.italic}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleStrike().run()} $active={editor.isActive('strike')} title="Strike">{icons.strike}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleCode().run()} $active={editor.isActive('code')} title="Code">{icons.code}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} $active={editor.isActive('bulletList')} title="Bullets">{icons.bulletList}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} $active={editor.isActive('orderedList')} title="Numbers">{icons.orderedList}</ToolbarButton>
        <ToolbarDivider />
        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} $active={editor.isActive('codeBlock')} title="Code Block">{icons.codeBlock}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} $active={editor.isActive('blockquote')} title="Quote">{icons.quote}</ToolbarButton>
        <ToolbarButton onClick={addTable} title="Table">{icons.table}</ToolbarButton>
        <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()} title="HR">{icons.hr}</ToolbarButton>
        
        <div style={{ flex: 1 }} />
        
        <CollabStatus>
          <CollabDot $status={status} />
          <span>{statusText[status]}</span>
        </CollabStatus>
        
        {users.length > 0 && (
          <CollabUsers>
            {users.slice(0, 3).map((u, i) => (
              <UserBadge key={i} $color={u.color} title={u.name}>{u.name.charAt(0)}</UserBadge>
            ))}
            {users.length > 3 && <UserBadge $color="#666">+{users.length - 3}</UserBadge>}
          </CollabUsers>
        )}
      </Toolbar>
      
      <EditorContent>
        <TiptapContent editor={editor} />
      </EditorContent>
    </>
  );
}

// Main component - handles HocuspocusProvider lifecycle
const CollaborativeEditor = ({ roomName, placeholder = 'Start writing...', collabUrl }) => {
  const [collab, setCollab] = useState(null);
  const providerRef = useRef(null);

  useEffect(() => {
    if (!collabUrl || !roomName) return;
    if (providerRef.current) return; // StrictMode guard

    const user = { name: getRandomName(), color: getRandomColor() };
    const ydoc = new Y.Doc();
    
    // Build WebSocket URL for HocusPocus
    // HocuspocusProvider wants the full URL including document name
    const wsBase = collabUrl.replace(/^https?/, (m) => m === 'https' ? 'wss' : 'ws');
    const wsUrl = `${wsBase}/collab`;
    
    console.log('[Collab] Creating HocuspocusProvider:', wsUrl, roomName);
    
    // Create HocuspocusProvider - much cleaner than y-websocket
    const provider = new HocuspocusProvider({
      url: wsUrl,
      name: roomName, // Document name (room)
      document: ydoc,
      // Set user info for awareness
      onAwarenessUpdate: ({ states }) => {
        // Optional: log awareness updates
      },
      onConnect: () => {
        console.log('[Collab] Connected to:', roomName);
      },
      onDisconnect: () => {
        console.log('[Collab] Disconnected from:', roomName);
      },
      onSynced: ({ state }) => {
        console.log('[Collab] Synced:', roomName, state);
      },
    });

    // Set user in awareness
    provider.awareness?.setLocalStateField('user', user);
    
    providerRef.current = { ydoc, provider };
    setCollab({ ydoc, provider, user });

    return () => {
      console.log('[Collab] Cleanup');
      providerRef.current = null;
      setCollab(null);
      
      // HocuspocusProvider handles cleanup more gracefully
      const p = provider;
      const d = ydoc;
      setTimeout(() => {
        p.destroy();
        d.destroy();
      }, 0);
    };
  }, [collabUrl, roomName]);

  return (
    <EditorContainer>
      {collab ? (
        <TiptapEditor collab={collab} placeholder={placeholder} />
      ) : (
        <div style={{ padding: 24, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
          <CollabDot $status="connecting" />
          <span>Connecting...</span>
        </div>
      )}
    </EditorContainer>
  );
};

export { CollaborativeEditor };
```

#### Key Client Changes:
1. **Import `HocuspocusProvider`** instead of `WebsocketProvider`
2. **Different constructor options:**
   - `url` - WebSocket URL (without document name)
   - `name` - Document name (room)
   - Built-in callbacks: `onConnect`, `onDisconnect`, `onSynced`
3. **Different event names:**
   - `status` event works similarly
   - `awarenessChange` instead of `awareness.on('change')`
   - States come pre-parsed in callback: `{ states: [...] }`
4. **Cleaner cleanup** - `provider.destroy()` handles everything
5. **No need for `connect: false`** - HocuspocusProvider handles connection timing

> 📝 **Note on events**: You can use either constructor callbacks (`onAwarenessChange: ({ states }) => {}`) or the event emitter pattern (`provider.on('awarenessChange', ...)`) - both work. The plan uses `.on()` for consistency with the existing y-websocket code pattern.

---

### Step 4: Update Dockerfile

**Complexity:** Simple ⭐
**Risk:** Low
**Time:** 5 minutes

```dockerfile
FROM node:22-alpine AS base

RUN apk add --no-cache libc6-compat

FROM base AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_CONVEX_URL=https://abundant-meadowlark-701.convex.cloud

RUN npm run build

FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

# Updated: Copy HocusPocus packages instead of y-websocket
COPY --from=builder /app/node_modules/@hocuspocus ./node_modules/@hocuspocus
COPY --from=builder /app/node_modules/yjs ./node_modules/yjs
COPY --from=builder /app/node_modules/ws ./node_modules/ws
COPY --from=builder /app/node_modules/lib0 ./node_modules/lib0
COPY --from=builder /app/node_modules/y-protocols ./node_modules/y-protocols

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
```

#### Changes:
- Remove `y-websocket` from copied modules
- Add `@hocuspocus` packages
- Add `y-protocols` (dependency of HocusPocus)

---

### Step 5: Testing

**Complexity:** Medium ⭐⭐
**Risk:** N/A
**Time:** 15-30 minutes

#### Local Testing Checklist:
```bash
# 1. Install new dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Test scenarios:
```

- [ ] **Single user:** Open editor, type content, refresh - content persists
- [ ] **Multi-user:** Open in 2 browser tabs, verify real-time sync
- [ ] **Reconnection:** Disconnect network briefly, verify reconnection
- [ ] **Awareness:** See other users' cursors (if cursor extension enabled)
- [ ] **Health endpoint:** `curl http://localhost:3000/health` returns room count
- [ ] **Persistence:** Check Convex dashboard for saved documents

#### Logs to Watch:
```
[HocusPocus] Client connecting to: {room}
[Convex] Loaded: {room} (X bytes)
[Convex] Saved: {room} (X bytes)
[HocusPocus] Client disconnected from: {room}
```

---

## Risks and Mitigations

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Breaking change in API** | Low | High | Both libraries use Yjs; document format is compatible |
| **Event name differences** | Medium | Medium | Documented above; test awareness carefully |
| **Reconnection behavior change** | Medium | Medium | HocusPocus has better defaults; monitor in prod |
| **Docker image size increase** | Low | Low | HocusPocus is ~200KB, minimal impact |
| **Existing documents incompatible** | Very Low | High | Both use same Yjs encoding; should work |

### Rollback Plan:
1. Keep old `server.js` as `server.js.bak`
2. Keep old `CollaborativeEditor/index.js` as `index.js.bak`
3. Git commit before migration for easy revert
4. If issues: `git checkout <commit>`, redeploy

---

## Why HocusPocus Fixes the Reconnection Loop

The original y-websocket issue likely stems from:

1. **Manual connection state management** - y-websocket requires `connect: false` + explicit `provider.connect()`, which can race with React StrictMode
2. **Missing debounce coordination** - Manual `scheduleSave` can conflict with connection lifecycle
3. **No built-in exponential backoff** - y-websocket reconnection is basic

HocusPocus solves these:
- **Built-in connection management** - Handles WebSocket lifecycle internally
- **Configurable debounce** - `debounce` and `maxDebounce` options
- **Smart reconnection** - Exponential backoff with jitter
- **Better cleanup** - `provider.destroy()` is comprehensive

---

## Post-Migration Enhancements (Optional)

Once stable, consider:

1. **Authentication:**
   ```javascript
   // server.js
   async onAuthenticate({ token, documentName }) {
     // Verify JWT or session
     const user = await verifyToken(token);
     if (!user) throw new Error('Unauthorized');
     return { user };
   }
   ```

2. **Read-only mode:**
   ```javascript
   async onConnect({ connection }) {
     if (someCondition) {
       connection.readOnly = true;
     }
   }
   ```

3. **Metrics/monitoring:**
   ```javascript
   async onStoreDocument({ documentName, state }) {
     metrics.increment('hocuspocus.documents.saved');
     metrics.gauge('hocuspocus.document.size', state.length);
   }
   ```

---

## Summary

| Step | File | Complexity | Time |
|------|------|------------|------|
| 1. Packages | package.json | ⭐ Simple | 5 min |
| 2. Server | server.js | ⭐⭐ Medium | 30-45 min |
| 3. Client | CollaborativeEditor/index.js | ⭐⭐ Medium | 30-45 min |
| 4. Docker | Dockerfile | ⭐ Simple | 5 min |
| 5. Testing | - | ⭐⭐ Medium | 15-30 min |

**Total: 2-4 hours**

The migration is straightforward because:
- Both libraries use Yjs (same document format)
- Same WebSocket path pattern maintained
- Convex integration unchanged (same HTTP API)
- HocusPocus is designed as a drop-in upgrade from y-websocket
