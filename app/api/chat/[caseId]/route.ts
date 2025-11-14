import { NextRequest, NextResponse } from 'next/server';
const { Case } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { QueryTypes } from 'sequelize';
import { sequelize } from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { caseId: caseIdStr } = await params;
    const caseId = parseInt(caseIdStr);

    // Check if user has access to this case
    const cases = await sequelize.query(`
      SELECT user_id, advocate_id FROM cases WHERE id = ?
    `, {
      replacements: [caseId],
      type: QueryTypes.SELECT
    });

    if (cases.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    const caseData = cases[0] as any;
    const hasAccess = 
      authResult.user.role === 'admin' ||
      (authResult.user.role === 'user' && caseData.user_id === authResult.user.userId) ||
      (authResult.user.role === 'advocate' && caseData.advocate_id === authResult.user.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this case' },
        { status: 403 }
      );
    }

    // Get chat messages
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

    return NextResponse.json({
      success: true,
      data: messages
    });

  } catch (error) {
    console.error('Get chat messages error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { caseId: caseIdStr } = await params;
    const caseId = parseInt(caseIdStr);
    const { message, message_type = 'text', file_url, file_name, file_size, file_type, file_key, document_id } = await request.json();

    if (!message && !file_url) {
      return NextResponse.json(
        { success: false, message: 'Message content or file is required' },
        { status: 400 }
      );
    }

    // Check if user has access to this case
    const cases = await sequelize.query(`
      SELECT user_id, advocate_id FROM cases WHERE id = ?
    `, {
      replacements: [caseId],
      type: QueryTypes.SELECT
    });

    if (cases.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    const caseData = cases[0] as any;
    const hasAccess = 
      authResult.user.role === 'admin' ||
      (authResult.user.role === 'user' && caseData.user_id === authResult.user.userId) ||
      (authResult.user.role === 'advocate' && caseData.advocate_id === authResult.user.userId);

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied to this case' },
        { status: 403 }
      );
    }

    // Insert message
    const [result] = await sequelize.query(`
      INSERT INTO chat_messages (
        case_id, user_id, message, message_type, file_url, file_name, file_size, file_type, file_key, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        caseId,
        authResult.user.userId,
        message || '',
        message_type,
        file_url || null,
        file_name || null,
        file_size || null,
        file_type || null,
        file_key || null
      ],
        type: QueryTypes.INSERT
    });

    const messageId = (result as any)[0];

    // Update document record to link it to this chat message if document_id is provided
    if (document_id && file_key) {
      try {
        await sequelize.query(`
          UPDATE documents 
          SET chat_message_id = ?, updated_at = NOW()
          WHERE id = ? AND case_id = ?
        `, {
          replacements: [messageId, document_id, caseId],
          type: QueryTypes.UPDATE
        });
      } catch (updateError) {
        console.error('Error linking document to chat message:', updateError);
        // Continue even if update fails
      }
    }

    // Get the created message with user info
    const messages = await sequelize.query(`
      SELECT 
        cm.*,
        u.name as user_name,
        u.email as user_email,
        u.role as user_role
      FROM chat_messages cm
      LEFT JOIN users u ON cm.user_id = u.id
      WHERE cm.id = ?
    `, {
      replacements: [messageId],
      type: QueryTypes.SELECT
    });

    return NextResponse.json({
      success: true,
      message: 'Message sent successfully',
      data: messages[0]
    });

  } catch (error) {
    console.error('Send message error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { caseId: caseIdStr } = await params;
    const caseId = parseInt(caseIdStr);
    const { messageId } = await request.json();

    if (!messageId) {
      return NextResponse.json(
        { success: false, message: 'Message ID is required' },
        { status: 400 }
      );
    }

    // Get message to check access and get file_key
    const messages = await sequelize.query(`
      SELECT cm.*, c.user_id as case_user_id, c.advocate_id
      FROM chat_messages cm
      JOIN cases c ON cm.case_id = c.id
      WHERE cm.id = ? AND cm.case_id = ?
    `, {
      replacements: [messageId, caseId],
      type: QueryTypes.SELECT
    });

    if (messages.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Message not found' },
        { status: 404 }
      );
    }

    const message = messages[0] as any;

    // Check access - user can delete their own messages or admin can delete any
    const hasAccess = 
      authResult.user.role === 'admin' ||
      message.user_id === authResult.user.userId;

    if (!hasAccess) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Delete file from S3 if file_key exists
    if (message.file_key) {
      const { s3Uploader } = await import('@/lib/aws-s3');
      await s3Uploader.deleteFile(message.file_key);
    }

    // Delete associated document record if it exists
    if (message.file_key) {
      try {
        await sequelize.query(`
          DELETE FROM documents WHERE s3_key = ? AND chat_message_id = ?
        `, {
          replacements: [message.file_key, messageId],
          type: QueryTypes.DELETE
        });
      } catch (docError) {
        console.error('Error deleting document record:', docError);
        // Continue even if document deletion fails
      }
    }

    // Delete message from database
    await sequelize.query(`
      DELETE FROM chat_messages WHERE id = ?
    `, {
      replacements: [messageId],
      type: QueryTypes.DELETE
    });

    return NextResponse.json({
      success: true,
      message: 'Message deleted successfully',
    });

  } catch (error) {
    console.error('Delete message error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
