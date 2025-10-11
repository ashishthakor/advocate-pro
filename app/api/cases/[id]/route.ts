import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/database';
import { verifyTokenFromRequest, hasRole } from '@/lib/auth';
import { QueryTypes } from 'sequelize';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const caseId = parseInt(id);

    // Get case details with user and advocate information
    const cases = await sequelize.query(`
      SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email,
        u.phone as user_phone,
        a.name as advocate_name,
        a.email as advocate_email,
        a.phone as advocate_phone,
        a.specialization
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.advocate_id = a.id
      WHERE c.id = ?
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

    // Check access permissions
    if (authResult.user.role === 'user' && caseData.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (authResult.user.role === 'advocate' && caseData.advocate_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: caseData
    });

  } catch (error) {
    console.error('Get case error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const caseId = parseInt(id);
    const updateData = await request.json();

    // Check if case exists and user has permission
    const existingCases = await sequelize.query(`
      SELECT * FROM cases WHERE id = ?
    `, {
      replacements: [caseId],
      type: QueryTypes.SELECT
    });

    if (existingCases.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    const existingCase = existingCases[0] as any;

    // Check permissions
    if (authResult.user.role === 'user' && existingCase.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    if (authResult.user.role === 'advocate' && existingCase.advocate_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Build update query
    const allowedFields = ['title', 'description', 'status', 'priority', 'court_name', 'judge_name', 'next_hearing_date', 'fees', 'fees_paid', 'advocate_id'];
    const updateFields = [];
    const replacements = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        replacements.push(value);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    replacements.push(caseId);

    await sequelize.query(`
      UPDATE cases 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, {
      replacements,
      type: QueryTypes.UPDATE
    });

    return NextResponse.json({
      success: true,
      message: 'Case updated successfully'
    });

  } catch (error) {
    console.error('Update case error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
