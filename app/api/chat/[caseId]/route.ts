import { NextRequest, NextResponse } from 'next/server';
const { Case } = require('models/init-models');
import { verifyTokenFromRequest } from 'lib/auth';
import { QueryTypes } from 'sequelize';
import { sequelize } from 'lib/database';

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
    const { message, message_type = 'text', file_url, file_name, file_size, file_type } = await request.json();

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
        case_id, user_id, message, message_type, file_url, file_name, file_size, file_type, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        caseId,
        authResult.user.userId,
        message || '',
        message_type,
        file_url || null,
        file_name || null,
        file_size || null,
        file_type || null
      ],
        type: QueryTypes.INSERT
    });

    const messageId = (result as any)[0];

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
