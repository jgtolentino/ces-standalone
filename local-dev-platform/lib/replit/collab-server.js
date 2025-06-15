const EventEmitter = require('events');

class CollaborationServer extends EventEmitter {
  constructor(wss) {
    super();
    
    this.wss = wss;
    this.rooms = new Map();
    this.clients = new Map();
    this.documents = new Map();
    
    this.setupWebSocketHandlers();
  }

  setupWebSocketHandlers() {
    this.wss.on('connection', (ws, req) => {
      const clientId = `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const client = {
        id: clientId,
        ws,
        rooms: new Set(),
        user: null,
        cursor: null,
        lastSeen: new Date(),
        metadata: {
          userAgent: req.headers['user-agent'],
          ip: req.socket.remoteAddress
        }
      };
      
      this.clients.set(clientId, client);
      console.log(`👥 Collaboration client connected: ${clientId}`);
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.handleCollabMessage(clientId, message);
        } catch (error) {
          console.error('Collaboration message error:', error);
          this.sendToClient(clientId, {
            type: 'error',
            error: 'Invalid message format'
          });
        }
      });
      
      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });
      
      // Send welcome message
      this.sendToClient(clientId, {
        type: 'connected',
        clientId,
        capabilities: ['real-time-editing', 'cursor-sharing', 'voice-chat'],
        timestamp: new Date().toISOString()
      });
    });
  }

  async handleCollabMessage(clientId, message) {
    const client = this.clients.get(clientId);
    if (!client) return;
    
    client.lastSeen = new Date();
    
    console.log(`👥 Collab message from ${clientId}:`, message.type);
    
    switch (message.type) {
      case 'join-room':
        await this.joinRoom(clientId, message.data.roomId, message.data.user);
        break;
        
      case 'leave-room':
        await this.leaveRoom(clientId, message.data.roomId);
        break;
        
      case 'document-edit':
        await this.handleDocumentEdit(clientId, message.data);
        break;
        
      case 'cursor-update':
        await this.handleCursorUpdate(clientId, message.data);
        break;
        
      case 'voice-signal':
        await this.handleVoiceSignal(clientId, message.data);
        break;
        
      case 'chat-message':
        await this.handleChatMessage(clientId, message.data);
        break;
        
      case 'file-operation':
        await this.handleFileOperation(clientId, message.data);
        break;
        
      default:
        console.warn(`Unknown collaboration message: ${message.type}`);
    }
  }

  async joinRoom(clientId, roomId, user) {
    console.log(`👥 Client ${clientId} joining room ${roomId}`);
    
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Create room if it doesn't exist
    if (!this.rooms.has(roomId)) {
      this.rooms.set(roomId, {
        id: roomId,
        clients: new Set(),
        documents: new Map(),
        chat: [],
        created: new Date(),
        lastActivity: new Date()
      });
    }
    
    const room = this.rooms.get(roomId);
    
    // Add client to room
    room.clients.add(clientId);
    client.rooms.add(roomId);
    client.user = user;
    
    // Notify other clients in room
    this.broadcastToRoom(roomId, {
      type: 'user-joined',
      data: {
        clientId,
        user,
        timestamp: new Date().toISOString()
      }
    }, clientId);
    
    // Send room state to new client
    this.sendToClient(clientId, {
      type: 'room-joined',
      data: {
        roomId,
        clients: Array.from(room.clients).map(id => {
          const c = this.clients.get(id);
          return {
            id,
            user: c?.user,
            cursor: c?.cursor,
            online: true
          };
        }),
        documents: Array.from(room.documents.entries()).map(([docId, doc]) => ({
          id: docId,
          ...doc
        })),
        chat: room.chat.slice(-50) // Last 50 messages
      }
    });
    
    console.log(`✅ Client ${clientId} joined room ${roomId}`);
  }

  async leaveRoom(clientId, roomId) {
    console.log(`👥 Client ${clientId} leaving room ${roomId}`);
    
    const client = this.clients.get(clientId);
    const room = this.rooms.get(roomId);
    
    if (!client || !room) return;
    
    // Remove client from room
    room.clients.delete(clientId);
    client.rooms.delete(roomId);
    
    // Notify other clients
    this.broadcastToRoom(roomId, {
      type: 'user-left',
      data: {
        clientId,
        user: client.user,
        timestamp: new Date().toISOString()
      }
    });
    
    // Clean up empty rooms
    if (room.clients.size === 0) {
      setTimeout(() => {
        if (room.clients.size === 0) {
          this.rooms.delete(roomId);
          console.log(`🧹 Cleaned up empty room: ${roomId}`);
        }
      }, 30000); // 30 second grace period
    }
  }

  async handleDocumentEdit(clientId, data) {
    const { roomId, documentId, operation, content } = data;
    const room = this.rooms.get(roomId);
    
    if (!room) return;
    
    // Apply operational transformation
    const transformedOp = this.transformOperation(roomId, documentId, operation);
    
    // Update document
    let document = room.documents.get(documentId);
    if (!document) {
      document = {
        id: documentId,
        content: '',
        version: 0,
        operations: [],
        lastModified: new Date()
      };
      room.documents.set(documentId, document);
    }
    
    // Apply operation to document
    document.content = this.applyOperation(document.content, transformedOp);
    document.version++;
    document.operations.push({
      ...transformedOp,
      clientId,
      timestamp: new Date(),
      version: document.version
    });
    document.lastModified = new Date();
    
    // Broadcast to other clients in room
    this.broadcastToRoom(roomId, {
      type: 'document-updated',
      data: {
        documentId,
        operation: transformedOp,
        version: document.version,
        clientId,
        timestamp: new Date().toISOString()
      }
    }, clientId);
    
    console.log(`📝 Document ${documentId} updated in room ${roomId}`);
  }

  transformOperation(roomId, documentId, operation) {
    // Operational Transformation (OT) algorithm
    // This is a simplified version - production would use a proper OT library
    
    const room = this.rooms.get(roomId);
    const document = room?.documents.get(documentId);
    
    if (!document) return operation;
    
    // Transform against concurrent operations
    let transformedOp = { ...operation };
    
    // Get operations that happened after this client's last known version
    const concurrentOps = document.operations.filter(op => 
      op.version > (operation.baseVersion || 0)
    );
    
    for (const concurrentOp of concurrentOps) {
      transformedOp = this.transformAgainstOperation(transformedOp, concurrentOp);
    }
    
    return transformedOp;
  }

  transformAgainstOperation(op1, op2) {
    // Simple transformation logic
    // In production, use a library like ShareJS or Yjs
    
    if (op1.type === 'insert' && op2.type === 'insert') {
      if (op1.position <= op2.position) {
        return op1;
      } else {
        return {
          ...op1,
          position: op1.position + op2.text.length
        };
      }
    }
    
    // Add more transformation rules for different operation types
    return op1;
  }

  applyOperation(content, operation) {
    switch (operation.type) {
      case 'insert':
        return content.slice(0, operation.position) + 
               operation.text + 
               content.slice(operation.position);
               
      case 'delete':
        return content.slice(0, operation.position) + 
               content.slice(operation.position + operation.length);
               
      case 'replace':
        return content.slice(0, operation.position) + 
               operation.text + 
               content.slice(operation.position + operation.length);
               
      default:
        return content;
    }
  }

  async handleCursorUpdate(clientId, data) {
    const { roomId, cursor } = data;
    const client = this.clients.get(clientId);
    
    if (!client) return;
    
    client.cursor = cursor;
    
    // Broadcast cursor position to other clients
    this.broadcastToRoom(roomId, {
      type: 'cursor-updated',
      data: {
        clientId,
        user: client.user,
        cursor,
        timestamp: new Date().toISOString()
      }
    }, clientId);
  }

  async handleVoiceSignal(clientId, data) {
    const { roomId, signal } = data;
    
    // Relay WebRTC signaling for voice chat
    this.broadcastToRoom(roomId, {
      type: 'voice-signal',
      data: {
        from: clientId,
        signal,
        timestamp: new Date().toISOString()
      }
    }, clientId);
  }

  async handleChatMessage(clientId, data) {
    const { roomId, message } = data;
    const client = this.clients.get(clientId);
    const room = this.rooms.get(roomId);
    
    if (!client || !room) return;
    
    const chatMessage = {
      id: `msg_${Date.now()}`,
      clientId,
      user: client.user,
      message,
      timestamp: new Date().toISOString()
    };
    
    room.chat.push(chatMessage);
    
    // Keep only last 100 messages
    if (room.chat.length > 100) {
      room.chat = room.chat.slice(-100);
    }
    
    // Broadcast to all clients in room
    this.broadcastToRoom(roomId, {
      type: 'chat-message',
      data: chatMessage
    });
  }

  async handleFileOperation(clientId, data) {
    const { roomId, operation, path, content } = data;
    
    // Handle file system operations in collaboration context
    this.broadcastToRoom(roomId, {
      type: 'file-operation',
      data: {
        clientId,
        operation,
        path,
        content,
        timestamp: new Date().toISOString()
      }
    }, clientId);
  }

  handleClientDisconnect(clientId) {
    console.log(`👋 Collaboration client disconnected: ${clientId}`);
    
    const client = this.clients.get(clientId);
    if (!client) return;
    
    // Remove client from all rooms
    client.rooms.forEach(roomId => {
      this.leaveRoom(clientId, roomId);
    });
    
    // Remove client
    this.clients.delete(clientId);
  }

  sendToClient(clientId, message) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === 1) { // WebSocket.OPEN
      client.ws.send(JSON.stringify(message));
    }
  }

  broadcastToRoom(roomId, message, excludeClientId = null) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    
    room.clients.forEach(clientId => {
      if (clientId !== excludeClientId) {
        this.sendToClient(clientId, message);
      }
    });
  }

  getStats() {
    return {
      clients: this.clients.size,
      rooms: this.rooms.size,
      totalDocuments: Array.from(this.rooms.values())
        .reduce((total, room) => total + room.documents.size, 0),
      activeRooms: Array.from(this.rooms.values())
        .filter(room => room.clients.size > 0).length
    };
  }

  getRoomInfo(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;
    
    return {
      id: roomId,
      clientCount: room.clients.size,
      documentCount: room.documents.size,
      messageCount: room.chat.length,
      created: room.created,
      lastActivity: room.lastActivity
    };
  }
}

module.exports = CollaborationServer;