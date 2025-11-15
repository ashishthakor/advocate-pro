import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { sequelize } from './database';
import { QueryTypes } from 'sequelize';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface AuthenticatedSocket extends Socket {
  userId?: number;
  userRole?: string;
  userEmail?: string;
}

interface ChatMessage {
  id?: number;
  case_id: number;
  user_id: number;
  message: string;
  message_type: 'text' | 'file' | 'image';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  file_key?: string;
  created_at?: Date;
}

export class SocketManager {
  private io: SocketIOServer;
  private connectedUsers: Map<number, string> = new Map(); // userId -> socketId

  constructor(server: HTTPServer) {
    this.io = new SocketIOServer(server, {
      cors: {
        origin: process.env.CORS_ORIGIN 
        ? process.env.CORS_ORIGIN.split(',').map(o => o.trim())
        : ["http://localhost:3000"],
        methods: ["GET", "POST"],
        credentials: true
      }
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware() {
    this.io.use(async (socket: AuthenticatedSocket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          return next(new Error('Authentication error: No token provided'));
        }

        const decoded = jwt.verify(token, JWT_SECRET) as any;
        socket.userId = decoded.userId;
        socket.userRole = decoded.role;
        socket.userEmail = decoded.email;

        next();
      } catch (err) {
        next(new Error('Authentication error: Invalid token'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket: AuthenticatedSocket) => {
      console.log(`User ${socket.userId} connected with socket ${socket.id}`);
      
      // Store user connection
      if (socket.userId) {
        this.connectedUsers.set(socket.userId, socket.id);
      }

      // Join case room
      socket.on('join_case', (caseId: number) => {
        this.handleJoinCase(socket, caseId);
      });

      // Leave case room
      socket.on('leave_case', (caseId: number) => {
        socket.leave(`case_${caseId}`);
        console.log(`User ${socket.userId} left case ${caseId}`);
      });

      // Send message
      socket.on('send_message', async (data: ChatMessage) => {
        await this.handleSendMessage(socket, data);
      });

      // Typing indicator
      socket.on('typing', (data: { caseId: number; isTyping: boolean }) => {
        this.handleTyping(socket, data);
      });

      // File upload
      socket.on('file_upload', async (data: { caseId: number; fileData: any }) => {
        await this.handleFileUpload(socket, data);
      });

      // Disconnect
      socket.on('disconnect', () => {
        if (socket.userId) {
          this.connectedUsers.delete(socket.userId);
        }
        console.log(`User ${socket.userId} disconnected`);
      });
    });
  }

  private async handleJoinCase(socket: AuthenticatedSocket, caseId: number) {
    try {
      // Check if user has access to this case
      const hasAccess = await this.checkCaseAccess(socket.userId!, caseId, socket.userRole!);
      
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to this case' });
        return;
      }

      socket.join(`case_${caseId}`);
      console.log(`User ${socket.userId} joined case ${caseId}`);

      // Send chat history
      const messages = await this.getChatHistory(caseId);
      socket.emit('chat_history', messages);

    } catch (error) {
      console.error('Error joining case:', error);
      socket.emit('error', { message: 'Failed to join case' });
    }
  }

  private async handleSendMessage(socket: AuthenticatedSocket, data: ChatMessage) {
    try {
      // Check access
      const hasAccess = await this.checkCaseAccess(socket.userId!, data.case_id, socket.userRole!);
      
      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied to this case' });
        return;
      }

      // Save message to database
      const [result] = await sequelize.query(`
        INSERT INTO chat_messages (
          case_id, user_id, message, message_type, file_url, file_name, file_size, file_type, file_key, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `, {
        replacements: [
          data.case_id,
          socket.userId,
          data.message,
          data.message_type || 'text',
          data.file_url || null,
          data.file_name || null,
          data.file_size || null,
          data.file_type || null,
          data.file_key || null
        ],
        type: QueryTypes.INSERT
      });

      const messageId = (result as any)[0];

      // Update document record to link it to this chat message if document_id is provided
      if ((data as any).document_id && data.file_key) {
        try {
          await sequelize.query(`
            UPDATE documents 
            SET chat_message_id = ?, updated_at = NOW()
            WHERE id = ? AND case_id = ?
          `, {
            replacements: [messageId, (data as any).document_id, data.case_id],
            type: QueryTypes.UPDATE
          });
        } catch (updateError) {
          console.error('Error linking document to chat message:', updateError);
          // Continue even if update fails
        }
      }

      // Get user info for the message
      const userInfo = await sequelize.query(`
        SELECT name, email, role FROM users WHERE id = ?
      `, {
        replacements: [socket.userId],
        type: QueryTypes.SELECT
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
        file_key: data.file_key,
        created_at: new Date(),
        user_name: (userInfo[0] as any)?.name,
        user_email: (userInfo[0] as any)?.email,
        user_role: (userInfo[0] as any)?.role
      };

      // Broadcast to all users in the case room
      this.io.to(`case_${data.case_id}`).emit('new_message', message);

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  }

  private handleTyping(socket: AuthenticatedSocket, data: { caseId: number; isTyping: boolean }) {
    socket.to(`case_${data.caseId}`).emit('user_typing', {
      userId: socket.userId,
      userName: socket.userEmail, // You might want to get the actual name
      isTyping: data.isTyping
    });
  }

  private async handleFileUpload(socket: AuthenticatedSocket, data: { caseId: number; fileData: any }) {
    // This would integrate with your file upload API
    // For now, just acknowledge the upload
    socket.emit('file_uploaded', { success: true });
  }

  private async checkCaseAccess(userId: number, caseId: number, userRole: string): Promise<boolean> {
    try {
      const cases = await sequelize.query(`
        SELECT user_id, advocate_id FROM cases WHERE id = ?
      `, {
        replacements: [caseId],
        type: QueryTypes.SELECT
      });

      if (cases.length === 0) {
        return false;
      }

      const caseData = cases[0] as any;

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

  private async getChatHistory(caseId: number): Promise<ChatMessage[]> {
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
        type: QueryTypes.SELECT
      });

      return messages as ChatMessage[];
    } catch (error) {
      console.error('Error getting chat history:', error);
      return [];
    }
  }

  public getIO(): SocketIOServer {
    return this.io;
  }
}

export default SocketManager;
