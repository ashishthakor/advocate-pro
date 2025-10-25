import { NextRequest, NextResponse } from 'next/server';
const { Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest, hasRole } from '@/lib/auth';

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

    // Check if case exists using Sequelize ORM
    const caseData = await Case.findOne({
      where: { id: caseId }
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    // Check if advocate exists and is approved using Sequelize ORM
    const advocate = await User.findOne({
      where: { 
        id: advocateId, 
        role: 'advocate', 
        is_approved: true 
      }
    });

    if (!advocate) {
      return NextResponse.json(
        { success: false, message: 'Advocate not found or not approved' },
        { status: 404 }
      );
    }

    // Update case with advocate assignment using Sequelize ORM
    await Case.update(
      { 
        advocate_id: advocateId, 
        status: 'active' 
      },
      { 
        where: { id: caseId } 
      }
    );

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