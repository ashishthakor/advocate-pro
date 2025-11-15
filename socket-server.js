const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./lib/database');
const { ChatMessage, Case, User, Document } = require('./models/init-models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.SOCKET_IO_PORT || 3001;

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
    : ["http://localhost:3000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map(); // userId -> socketId

// Authentication middleware
io.use(async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    socket.userId = decoded.userId;
    socket.userRole = decoded.role;
    socket.userEmail = decoded.email;

    next();
  } catch (err) {
    next(new Error('Authentication error: Invalid token'));
  }
});

// Connection handler
io.on('connection', (socket) => {
  console.log(`User ${socket.userId} connected with socket ${socket.id}`);
  
  // Store user connection
  if (socket.userId) {
    connectedUsers.set(socket.userId, socket.id);
  }

  // Join case room
  socket.on('join_case', async (caseId) => {
    try {
      // Check if user has access to this case
      const hasAccess = await checkCaseAccess(socket.userId, caseId, socket.userRole);
      
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to this case' });
        return;
      }

      socket.join(`case_${caseId}`);
      console.log(`[Socket] User ${socket.userId} (${socket.userRole}) joined case ${caseId}, room: case_${caseId}`);
      
      // Verify room membership
      const room = io.sockets.adapter.rooms.get(`case_${caseId}`);
      const roomSize = room ? room.size : 0;
      console.log(`[Socket] Room case_${caseId} now has ${roomSize} connected clients after join`);

      // Send chat history
      const messages = await getChatHistory(caseId);
      socket.emit('chat_history', messages);

    } catch (error) {
      console.error('Error joining case:', error);
      socket.emit('error', { message: 'Failed to join case' });
    }
  });

  // Leave case room
  socket.on('leave_case', (caseId) => {
    socket.leave(`case_${caseId}`);
    console.log(`User ${socket.userId} left case ${caseId}`);
  });

  // Send message
  socket.on('send_message', async (data) => {
    try {
      // Check access
      const hasAccess = await checkCaseAccess(socket.userId, data.case_id, socket.userRole);
      
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to this case' });
        return;
      }

      // Save message to database using Sequelize ORM
      const newMessage = await ChatMessage.create({
        case_id: data.case_id,
        user_id: socket.userId,
        message: data.message,
        message_type: data.message_type || 'text',
        file_url: data.file_url || null,
        file_name: data.file_name || null,
        file_size: data.file_size || null,
        file_type: data.file_type || null,
        file_key: data.file_key || null
      });

      const messageId = newMessage.id;

      // Update document record to link it to this chat message if document_id is provided
      if (data.document_id && data.file_key) {
        try {
          await Document.update(
            { chat_message_id: messageId },
            {
              where: {
                id: data.document_id,
                case_id: data.case_id
              }
            }
          );
        } catch (updateError) {
          console.error('Error linking document to chat message:', updateError);
          // Continue even if update fails
        }
      }

      // Get user info for the message using Sequelize ORM
      const userInfo = await User.findByPk(socket.userId, {
        attributes: ['name', 'email', 'role']
      });

      // Build message object with user info
      const message = {
        id: messageId,
        case_id: data.case_id,
        user_id: socket.userId,
        message: data.message,
        message_type: data.message_type || 'text',
        file_url: data.file_url,
        file_name: data.file_name,
        file_size: data.file_size,
        file_type: data.file_type,
        file_key: data.file_key,
        created_at: newMessage.created_at || new Date(),
        user_name: userInfo?.name || 'Unknown',
        user_email: userInfo?.email || '',
        user_role: userInfo?.role || 'user'
      };

      // Broadcast to all users in the case room
      io.to(`case_${data.case_id}`).emit('new_message', message);

    } catch (error) {
      console.error('Error sending message:', error);
      console.error('Error details:', {
        message: error.message,
        name: error.name,
        code: error.code
      });
      socket.emit('error', { 
        message: 'Failed to send message',
        details: error.message 
      });
    }
  });

  // Typing indicator
  socket.on('typing', (data) => {
    socket.to(`case_${data.caseId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.userEmail,
      isTyping: data.isTyping
    });
  });

  // File upload
  socket.on('file_upload', async (data) => {
    // This would integrate with your file upload API
    // For now, just acknowledge the upload
    socket.emit('file_uploaded', { success: true });
  });

  // Delete message handler - handles deletion requests from clients
  socket.on('delete_message', async (data, callback) => {
    try {
      const { case_id, message_id } = data;

      if (!case_id || !message_id) {
        const error = 'Invalid request: case_id and message_id are required';
        socket.emit('error', { message: error });
        if (callback) callback({ error });
        return;
      }

      console.log(`[Socket] Delete message request: case=${case_id}, message=${message_id}, user=${socket.userId}, socketId=${socket.id}`);

      // 1. Check case access
      const hasAccess = await checkCaseAccess(socket.userId, case_id, socket.userRole);
      
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to this case' });
        return;
      }

      // 2. Check if message exists (it might already be deleted by API)
      let message = null;
      try {
        message = await ChatMessage.findByPk(message_id, {
          attributes: ['id', 'user_id', 'case_id', 'file_key']
        });
      } catch (findError) {
        console.log(`[Socket] Error finding message ${message_id} (likely already deleted):`, findError.message);
        // Message might not exist - this is OK, API already deleted it
        message = null;
      }

      // 3. If message doesn't exist, it was already deleted by API - just broadcast
      // This is EXPECTED behavior, not an error
      if (!message) {
        console.log(`[Socket] Message ${message_id} already deleted by API (expected), broadcasting deletion event to case_${case_id}`);
        // Get all sockets in the room to verify
        const room = io.sockets.adapter.rooms.get(`case_${case_id}`);
        const roomSize = room ? room.size : 0;
        console.log(`[Socket] Room case_${case_id} has ${roomSize} connected clients`);
        
        // List all socket IDs in the room for debugging
        if (room) {
          const socketIds = Array.from(room);
          console.log(`[Socket] Socket IDs in room:`, socketIds);
        } else {
          console.warn(`[Socket] Room case_${case_id} does not exist! Users may not have joined the room.`);
        }
        
        // Broadcast to all users in the case room
        const deleteEvent = {
          message_id: message_id,
          case_id: case_id
        };
        
        // Use io.to() to broadcast to ALL sockets in the room (including sender)
        io.to(`case_${case_id}`).emit('message_deleted', deleteEvent);
        console.log(`[Socket] Broadcasted message_deleted event for case ${case_id}, message ${message_id} to ${roomSize} clients via io.to()`);
        
        // Also use socket.to() to broadcast to others (excluding sender) as additional measure
        socket.to(`case_${case_id}`).emit('message_deleted', deleteEvent);
        console.log(`[Socket] Also broadcasted via socket.to() to others in case ${case_id}`);
        
        // Acknowledge to sender - this is SUCCESS, not an error
        // DO NOT emit error - message already deleted is expected behavior
        if (callback) {
          callback({ success: true, broadcasted: true, roomSize, messageAlreadyDeleted: true });
        }
        // Explicitly do NOT emit error here - this is normal flow
        return;
      }

      // 4. Verify message belongs to the case
      if (message.case_id !== case_id) {
        const error = 'Message does not belong to this case';
        socket.emit('error', { message: error });
        if (callback) callback({ error });
        return;
      }

      // 5. Authorization check - user can delete their own messages, admin can delete any
      if (socket.userRole !== 'admin' && message.user_id !== socket.userId) {
        const error = 'Access denied. You can only delete your own messages.';
        socket.emit('error', { message: error });
        if (callback) callback({ error });
        return;
      }

      // 6. Delete associated document record first
      if (message.file_key) {
        try {
          const { Op } = require('sequelize');
          await Document.destroy({
            where: {
              [Op.or]: [
                { chat_message_id: message_id },
                { s3_key: message.file_key, case_id: case_id }
              ]
            }
          });
          console.log(`[Socket] Deleted document record for message ${message_id}`);
        } catch (docError) {
          console.error('[Socket] Error deleting document record:', docError);
          // Continue even if document deletion fails
        }
      }

      // 7. Delete file from S3 if file_key exists
      if (message.file_key) {
        try {
          const { s3Uploader } = require('./lib/aws-s3');
          await s3Uploader.deleteFile(message.file_key);
          console.log(`[Socket] Deleted S3 file: ${message.file_key}`);
        } catch (s3Error) {
          console.error('[Socket] Error deleting file from S3:', s3Error);
          // Continue even if S3 deletion fails
        }
      }

      // 8. Delete message from database
      await ChatMessage.destroy({
        where: { id: message_id }
      });
      console.log(`[Socket] Deleted chat message ${message_id} from database`);

      // 9. Broadcast deletion to all users in the case room
      // Get all sockets in the room to verify
      const room = io.sockets.adapter.rooms.get(`case_${case_id}`);
      const roomSize = room ? room.size : 0;
      console.log(`[Socket] Room case_${case_id} has ${roomSize} connected clients before broadcast`);
      
      // List all socket IDs in the room for debugging
      if (room) {
        const socketIds = Array.from(room);
        console.log(`[Socket] Socket IDs in room:`, socketIds);
      }
      
      // Broadcast to all users in the case room
      const deleteEvent = {
        message_id: message_id,
        case_id: case_id
      };
      
      // Use io.to() to broadcast to ALL sockets in the room (including sender)
      io.to(`case_${case_id}`).emit('message_deleted', deleteEvent);
      console.log(`[Socket] Broadcasted message_deleted event for case ${case_id}, message ${message_id} to ${roomSize} clients via io.to()`);
      
      // Also use socket.to() to broadcast to others (excluding sender) as additional measure
      socket.to(`case_${case_id}`).emit('message_deleted', deleteEvent);
      console.log(`[Socket] Also broadcasted via socket.to() to others in case ${case_id}`);
      
      // Acknowledge to sender
      if (callback) {
        callback({ success: true, broadcasted: true, roomSize });
      }

    } catch (error) {
      console.error('[Socket] Error deleting message:', error);
      
      // Even if there's an error, try to broadcast the deletion event
      // This ensures other users still get notified
      try {
        const deleteEvent = {
          message_id: message_id,
          case_id: case_id
        };
        io.to(`case_${case_id}`).emit('message_deleted', deleteEvent);
        socket.to(`case_${case_id}`).emit('message_deleted', deleteEvent);
        console.log(`[Socket] Broadcasted message_deleted event despite error for case ${case_id}, message ${message_id}`);
      } catch (broadcastError) {
        console.error('[Socket] Failed to broadcast deletion event:', broadcastError);
      }
      
      // Only emit error if it's not a "message not found" type error
      // (message already deleted is expected behavior)
      if (!error.message || !error.message.toLowerCase().includes('not found')) {
        const errorMsg = {
          message: 'Failed to delete message',
          details: error.message
        };
        socket.emit('error', errorMsg);
        if (callback) callback({ error: errorMsg.message });
      } else {
        // Message not found is OK - API already deleted it
        console.log(`[Socket] Message ${message_id} not found (expected), broadcasting deletion event`);
        if (callback) callback({ success: true, broadcasted: true, messageAlreadyDeleted: true });
      }
    }
  });

  // Disconnect
  socket.on('disconnect', () => {
    if (socket.userId) {
      connectedUsers.delete(socket.userId);
    }
    console.log(`User ${socket.userId} disconnected`);
  });
});

// Helper functions
async function checkCaseAccess(userId, caseId, userRole) {
  try {
    const caseData = await Case.findByPk(caseId, {
      attributes: ['user_id', 'advocate_id']
    });

    if (!caseData) {
      return false;
    }

    // Admin can access all cases
    if (userRole === 'admin') {
      return true;
    }

    // User can access their own cases
    if (userRole === 'user' && caseData.user_id === userId) {
      return true;
    }

    // Advocate can access assigned cases
    if (userRole === 'advocate' && caseData.advocate_id === userId) {
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking case access:', error);
    return false;
  }
}

async function getChatHistory(caseId) {
  try {
    const messages = await ChatMessage.findAll({
      where: { case_id: caseId },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['name', 'email', 'role'],
          required: false
        }
      ],
      order: [['created_at', 'ASC']],
      raw: false
    });

    // Transform to match expected format with flat user fields
    return messages.map(msg => {
      const msgData = msg.toJSON ? msg.toJSON() : msg;
      const { sender, ...rest } = msgData;
      return {
        ...rest,
        user_name: sender?.name || 'Unknown',
        user_email: sender?.email || '',
        user_role: sender?.role || 'user'
      };
    });
  } catch (error) {
    console.error('Error getting chat history:', error);
    return [];
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});

module.exports = { io, httpServer };
