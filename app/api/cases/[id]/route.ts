import { NextRequest, NextResponse } from 'next/server';
const { Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { logCaseAssigned, logCaseStatusChanged } from '@/lib/activity-logger';
import { col } from 'sequelize';

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
    // Use attributes with col to directly select joined columns as flat fields
    const caseData = await Case.findOne({
      where: { id: caseId },
      attributes: {
        include: [
          [col('user.name'), 'user_name'],
          [col('user.email'), 'user_email'],
          [col('user.phone'), 'user_phone'],
          [col('advocate.name'), 'advocate_name'],
          [col('advocate.email'), 'advocate_email'],
          [col('advocate.phone'), 'advocate_phone'],
          [col('advocate.specialization'), 'advocate_specialization']
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [] // Don't include nested user object
        },
        {
          model: User,
          as: 'advocate',
          attributes: [], // Don't include nested advocate object
          required: false // LEFT JOIN for advocate (can be null)
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

    // Case already has flat fields from attributes literal, just convert to JSON
    const caseDataJson = caseData.toJSON ? caseData.toJSON() : caseData;
    const transformedCase = {
      ...caseDataJson,
      // Ensure advocate_id is properly set (could be null)
      advocate_id: caseDataJson.advocate_id || null,
    };

    return NextResponse.json({
      success: true,
      data: transformedCase
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

    // Store old values for activity logging
    const oldStatus = existingCase.status;
    const oldAdvocateId = existingCase.advocate_id;

    // Check permissions - Admin can update any case
    if (authResult.user.role === 'user' && existingCase.user_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Advocates can only update cases assigned to them, but admin can update any case
    if (authResult.user.role === 'advocate' && existingCase.advocate_id !== authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    // Prevent updating fees if payment is already completed
    if (updateData.hasOwnProperty('fees')) {
      const { Payment } = require('@/models/init-models');
      const completedPayment = await Payment.findOne({
        where: {
          case_id: caseId,
          status: 'completed'
        }
      });

      if (completedPayment) {
        return NextResponse.json(
          { success: false, message: 'Cannot edit fees for cases with completed payments' },
          { status: 400 }
        );
      }
    }

    // Prevent users from updating cases with pending_payment status
    if (authResult.user.role === 'user' && existingCase.status === 'pending_payment') {
      return NextResponse.json(
        { success: false, message: 'Cannot update case until payment is completed' },
        { status: 400 }
      );
    }

    // Prevent admin from updating case status if payment is pending
    if (authResult.user.role === 'admin' && updateData.hasOwnProperty('status')) {
      const { Payment } = require('@/models/init-models');
      const pendingPayment = await Payment.findOne({
        where: {
          case_id: caseId,
          status: 'pending'
        }
      });

      // Block status update if payment is pending
      if (pendingPayment) {
        return NextResponse.json(
          { success: false, message: 'Cannot update case status. Payment is still pending. Please wait for payment completion or mark payment as paid.' },
          { status: 400 }
        );
      }
    }

    // Prevent admin from updating status to pending_payment if payment is already completed
    // Allow changing to pending_payment only if no completed payment exists
    if (updateData.hasOwnProperty('status') && updateData.status === 'pending_payment') {
      const { Payment } = require('@/models/init-models');
      const completedPayment = await Payment.findOne({
        where: {
          case_id: caseId,
          status: 'completed'
        }
      });

      // Only block if payment is already completed
      if (completedPayment) {
        return NextResponse.json(
          { success: false, message: 'Cannot change status to pending_payment. Payment has already been completed for this case.' },
          { status: 400 }
        );
      }
      // If no completed payment exists, allow the status change to pending_payment
    }

    // Update case using Sequelize ORM
    const allowedFields = ['title', 'description', 'status', 'priority', 'court_name', 'judge_name', 'next_hearing_date', 'fees', 'fees_paid', 'advocate_id'];
    const updateData_filtered: any = {};
    
    for (const [key, value] of Object.entries(updateData)) {
      // Allow null values for advocate_id (to unassign), but exclude undefined
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'advocate_id' && value === null) {
          updateData_filtered[key] = null;
        } else if (key === 'advocate_id' && value === '') {
          // Allow empty string to be converted to null for unassignment
          updateData_filtered[key] = null;
        } else {
          updateData_filtered[key] = value;
        }
      }
    }

    if (Object.keys(updateData_filtered).length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    await existingCase.update(updateData_filtered);

    // Log activities for status changes and assignments
    if (updateData_filtered.status && updateData_filtered.status !== oldStatus) {
      await logCaseStatusChanged(
        existingCase.toJSON ? existingCase.toJSON() : existingCase,
        oldStatus,
        updateData_filtered.status,
        authResult.user.userId
      );
    }

    if (updateData_filtered.hasOwnProperty('advocate_id') && updateData_filtered.advocate_id !== oldAdvocateId) {
      if (updateData_filtered.advocate_id) {
        // Case assigned
        const advocate = await User.findOne({
          where: { id: updateData_filtered.advocate_id },
          attributes: ['name']
        });
        if (advocate) {
          await logCaseAssigned(
            existingCase.toJSON ? existingCase.toJSON() : existingCase,
            updateData_filtered.advocate_id,
            advocate.name
          );
        }
      }
      // Note: Unassignment could be logged here if needed
    }

    // Fetch the updated case with user and advocate information
    // Use attributes with col to directly select joined columns as flat fields
    const updatedCase = await Case.findOne({
      where: { id: caseId },
      attributes: {
        include: [
          [col('user.name'), 'user_name'],
          [col('user.email'), 'user_email'],
          [col('advocate.name'), 'advocate_name'],
          [col('advocate.email'), 'advocate_email']
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [] // Don't include nested user object
        },
        {
          model: User,
          as: 'advocate',
          attributes: [], // Don't include nested advocate object
          required: false // LEFT JOIN for advocate (can be null)
        }
      ]
    });

    // Case already has flat fields from attributes col, just convert to JSON
    if (updatedCase) {
      const caseData = updatedCase.toJSON ? updatedCase.toJSON() : updatedCase;
      const transformedCase = {
        ...caseData,
        // Ensure advocate_id is properly set (could be null)
        advocate_id: caseData.advocate_id || null,
      };

      return NextResponse.json({
        success: true,
        message: 'Case updated successfully',
        data: transformedCase
      });
    }

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
