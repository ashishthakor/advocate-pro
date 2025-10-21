const { createServer } = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const { sequelize } = require('./lib/database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const PORT = process.env.SOCKET_IO_PORT || 3001;

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server
const io = new Server(httpServer, {
  cors: {
    origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
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

      // Save message to database
      const [result] = await sequelize.query(`
        INSERT INTO chat_messages (
          case_id, user_id, message, message_type, file_url, file_name, file_size, file_type, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          data.case_id,
          socket.userId,
          data.message,
          data.message_type || 'text',
          data.file_url || null,
          data.file_name || null,
          data.file_size || null,
          data.file_type || null
        ],
        type: sequelize.QueryTypes.INSERT
      });

      const messageId = result[0];

      // Get user info for the message
      const userInfo = await sequelize.query(`
        SELECT name, email, role FROM users WHERE id = ?
      `, {
        replacements: [socket.userId],
        type: sequelize.QueryTypes.SELECT
      });

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
        created_at: new Date(),
        user_name: userInfo[0]?.name,
        user_email: userInfo[0]?.email,
        user_role: userInfo[0]?.role
      };

      // Broadcast to all users in the case room
      io.to(`case_${data.case_id}`).emit('new_message', message);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
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
    const cases = await sequelize.query(`
      SELECT user_id, advocate_id FROM cases WHERE id = ?
    `, {
      replacements: [caseId],
      type: sequelize.QueryTypes.SELECT
    });

    if (cases.length === 0) {
      return false;
    }

    const caseData = cases[0];

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
    const messages = await sequelize.query(`
      SELECT 
        cm.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.case_id = ?
      ORDER BY cm.created_at ASC
    `, {
      replacements: [caseId],
      type: sequelize.QueryTypes.SELECT
    });

    return messages;
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
