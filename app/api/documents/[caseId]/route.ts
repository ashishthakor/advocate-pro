import { NextRequest, NextResponse } from 'next/server';
import { verifyTokenFromRequest } from '@/lib/auth';
import { sequelize } from '@/lib/database';
import { QueryTypes } from 'sequelize';

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

    // Get documents for this case
    const documents = await sequelize.query(`
      SELECT 
        d.*,
        u.name as uploaded_by_name,
        u.email as uploaded_by_email
      FROM documents d
      LEFT JOIN users u ON d.uploaded_by = u.id
      WHERE d.case_id = ?
      ORDER BY d.created_at DESC
    `, {
      replacements: [caseId],
      type: QueryTypes.SELECT
    });

    return NextResponse.json({
      success: true,
      data: documents
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

