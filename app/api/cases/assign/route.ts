import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/database';
import { verifyTokenFromRequest, hasRole } from '@/lib/auth';
import { QueryTypes } from 'sequelize';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can assign cases
    if (!hasRole(authResult.user, ['admin'])) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { caseId, advocateId } = await request.json();

    if (!caseId || !advocateId) {
      return NextResponse.json(
        { success: false, message: 'Case ID and Advocate ID are required' },
        { status: 400 }
      );
    }

    // Check if case exists
    const cases = await sequelize.query(`
      SELECT * FROM cases WHERE id = ?
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

    // Check if advocate exists and is approved
    const advocates = await sequelize.query(`
      SELECT * FROM users WHERE id = ? AND role = 'advocate' AND is_approved = true
    `, {
      replacements: [advocateId],
      type: QueryTypes.SELECT
    });

    if (advocates.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Advocate not found or not approved' },
        { status: 404 }
      );
    }

    // Update case with advocate assignment
    await sequelize.query(`
      UPDATE cases 
      SET advocate_id = ?, status = 'active', updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [advocateId, caseId],
      type: QueryTypes.UPDATE
    });

    return NextResponse.json({
      success: true,
      message: 'Case assigned successfully'
    });

  } catch (error) {
    console.error('Assign case error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}