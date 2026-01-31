import { NextRequest, NextResponse } from 'next/server';
const { Case, User, Payment } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { logCaseAssigned, logCaseStatusChanged } from '@/lib/activity-logger';
import { calculateFeeWithGst } from '@/lib/fee-calculator';
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

    // Get the latest completed payment for this case with marked_by user info
    const latestPayment = await Payment.findOne({
      where: {
        case_id: caseId,
        status: 'completed'
      },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'markedByUser',
          attributes: ['id', 'name', 'email'],
          required: false
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
    
    // Extract payment information and add directly to case data
    let transaction_id = null;
    let marked_by_name = null;
    if (latestPayment) {
      const paymentJson = latestPayment.toJSON ? latestPayment.toJSON() : latestPayment;
      transaction_id = paymentJson.transaction_id || null;
      marked_by_name = paymentJson.markedByUser?.name || null;
    }

    const transformedCase = {
      ...caseDataJson,
      // Ensure advocate_id is properly set (could be null)
      advocate_id: caseDataJson.advocate_id || null,
      // Add payment fields directly to case
      transaction_id: transaction_id,
      marked_by_name: marked_by_name
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

    // Prevent admin from updating case status if payment is pending
    // Only block if there's a pending payment AND no completed payment exists
    if (authResult.user.role === 'admin' && updateData.hasOwnProperty('status')) {
      const { Payment } = require('@/models/init-models');
      
      // Check for completed payment first
      const completedPayment = await Payment.findOne({
        where: {
          case_id: caseId,
          status: 'completed'
        }
      });

      // If there's a completed payment, allow status update
      if (completedPayment) {
        // Allow status update - payment is completed
      } else {
        // Check if there's a pending payment (and no completed payment)
        const pendingPayment = await Payment.findOne({
          where: {
            case_id: caseId,
            status: 'pending'
          }
        });

        // Block status update if payment is pending and no completed payment exists
        if (pendingPayment) {
          return NextResponse.json(
            { success: false, message: 'Cannot update case status. Payment is still pending. Please wait for payment completion or mark payment as paid.' },
            { status: 400 }
          );
        }
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

    // Update case using Sequelize ORM – allow all create-case fields for full edit
    const allowedFields = [
      'title', 'description', 'status', 'priority', 'case_type', 'court_name', 'judge_name',
      'next_hearing_date', 'fees', 'fees_paid', 'start_date', 'end_date', 'advocate_id',
      'dispute_date', 'dispute_amount',
      'requester_name', 'requester_email', 'requester_phone', 'requester_address',
      'requester_business_name', 'requester_gst_number',
      'respondent_name', 'respondent_email', 'respondent_phone', 'respondent_address',
      'respondent_business_name', 'respondent_gst_number',
      'relationship_between_parties', 'nature_of_dispute', 'brief_description_of_dispute',
      'occurrence_date', 'prior_communication', 'prior_communication_other',
      'sought_monetary_claim', 'sought_settlement', 'sought_other'
    ];
    if (authResult.user.role === 'admin' || authResult.user.role === 'advocate') {
      allowedFields.push('tracking_id');
    }
    if (authResult.user.role === 'admin') {
      allowedFields.push('user_id');
    }
    const updateData_filtered: any = {};

    // If dispute_amount is being updated and no completed payment, recalc fees (base + 18% GST)
    if (updateData.hasOwnProperty('dispute_amount') && updateData.dispute_amount != null && Number(updateData.dispute_amount) > 0) {
      const completedPayment = await Payment.findOne({ where: { case_id: caseId, status: 'completed' } });
      if (!completedPayment) {
        const { total } = calculateFeeWithGst(Number(updateData.dispute_amount));
        updateData_filtered.fees = total;
      }
    }

    const dateFields = ['next_hearing_date', 'start_date', 'end_date', 'occurrence_date', 'dispute_date'];
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        if (key === 'advocate_id' && (value === null || value === '')) {
          updateData_filtered[key] = null;
        } else if (key === 'user_id' && (value === null || value === '')) {
          // user_id is required; only admin can set it – don't allow clearing
          if (value !== null && value !== '') {
            updateData_filtered[key] = typeof value === 'number' ? value : parseInt(String(value), 10);
          }
        } else if (key === 'dispute_amount') {
          updateData_filtered[key] = value === '' || value == null ? null : parseFloat(String(value));
        } else if (dateFields.includes(key)) {
          updateData_filtered[key] = value === '' || value == null ? null : value;
        } else if (key === 'sought_monetary_claim' || key === 'sought_settlement') {
          updateData_filtered[key] = Boolean(value);
        } else if (key === 'fees' || key === 'fees_paid') {
          updateData_filtered[key] = value === '' || value == null ? 0 : parseFloat(String(value));
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
