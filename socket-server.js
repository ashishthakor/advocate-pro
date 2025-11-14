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
      console.log(`User ${socket.userId} joined case ${caseId}`);

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
