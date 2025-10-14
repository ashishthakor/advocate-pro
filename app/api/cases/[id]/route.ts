import { NextRequest, NextResponse } from 'next/server';
const { Case, User } = require('models/init-models');
import { verifyTokenFromRequest } from 'lib/auth';

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

    // Get case details with user and advocate information using Sequelize ORM
    const caseData = await Case.findOne({
      where: { id: caseId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email', 'phone']
        },
        {
          model: User,
          as: 'advocate',
          attributes: ['name', 'email', 'phone', 'specialization']
        }
      ]
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

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

    // Check if case exists and user has permission using Sequelize ORM
    const existingCase = await Case.findOne({
      where: { id: caseId }
    });

    if (!existingCase) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

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

    // Update case using Sequelize ORM
    const allowedFields = ['title', 'description', 'status', 'priority', 'court_name', 'judge_name', 'next_hearing_date', 'fees', 'fees_paid', 'advocate_id'];
    const updateData_filtered: any = {};
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateData_filtered[key] = value;
      }
    }

    if (Object.keys(updateData_filtered).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await existingCase.update(updateData_filtered);

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
