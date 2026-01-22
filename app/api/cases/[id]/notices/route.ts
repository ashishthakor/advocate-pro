import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { Op } from 'sequelize';

/**
 * GET /api/cases/[id]/notices
 * Get all notices for a specific case, ordered by notice number
 */
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

    const user = authResult.user;
    if (user.role !== 'admin' && user.role !== 'user' && user.role !== 'advocate') {
      return NextResponse.json(
        { success: false, message: 'Access denied.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const caseId = parseInt(id);

    // Get case with user details
    const caseData = await Case.findOne({
      where: { id: caseId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        }
      ]
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    // Check access: user can only access notices for their cases, advocate for assigned cases
    if (user.role === 'user' && caseData.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only access notices for your cases.' },
        { status: 403 }
      );
    }
    if (user.role === 'advocate' && caseData.advocate_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only access notices for your assigned cases.' },
        { status: 403 }
      );
    }

    // Get all notices for this case
    const notices = await Notice.findAll({
      where: {
        case_id: caseId,
        deleted_at: null
      },
      order: [
        ['notice_number', 'ASC'], // Order by notice number: 1, 2, 3, 4...
        ['created_at', 'ASC'] // Then by creation date
      ],
      include: [
        {
          model: Case,
          as: 'case',
          attributes: ['id', 'case_number', 'title']
        }
      ]
    });

    return NextResponse.json({
      success: true,
      data: {
        case: {
          id: caseData.id,
          case_number: caseData.case_number,
          title: caseData.title
        },
        notices
      }
    });
  } catch (error: any) {
    console.error('Error fetching case notices:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch case notices' },
      { status: 500 }
    );
  }
}
