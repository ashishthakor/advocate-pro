import { NextRequest, NextResponse } from 'next/server';
const { Payment, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { logCaseCreated } from '@/lib/activity-logger';
import { col } from 'sequelize';
import { PAYMENT_CONSTANTS } from '@/lib/payment-constants';

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Only admins can manually mark payments as paid
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.ONLY_ADMINS },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { case_id, amount, notes } = body;

    if (!case_id) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.CASE_ID_REQUIRED },
        { status: 400 }
      );
    }

    // Find the case
    const case_ = await Case.findByPk(case_id);
    if (!case_) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.CASE_NOT_FOUND },
        { status: 404 }
      );
    }

    // Check if case is in pending_payment status
    if (case_.status !== 'pending_payment') {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.CASE_NOT_PENDING },
        { status: 400 }
      );
    }

    // Use custom fees from case if set, otherwise use provided amount or default
    let paymentAmount: number = PAYMENT_CONSTANTS.CASE_REGISTRATION_FEE;
    if (case_.fees && parseFloat(case_.fees) > 0) {
      paymentAmount = parseFloat(case_.fees);
    } else if (amount && parseFloat(amount) > 0) {
      paymentAmount = parseFloat(amount);
    }

    // Create a manual payment record
    const payment = await Payment.create({
      user_id: case_.user_id,
      case_id: case_.id,
      razorpay_order_id: `manual_${Date.now()}_${case_.id}`,
      razorpay_payment_id: `manual_payment_${Date.now()}_${case_.id}`,
      razorpay_signature: null,
      amount: paymentAmount,
      currency: PAYMENT_CONSTANTS.CURRENCY,
      status: PAYMENT_CONSTANTS.STATUS.COMPLETED,
      payment_method: PAYMENT_CONSTANTS.METHOD.MANUAL,
      payment_description: PAYMENT_CONSTANTS.DESCRIPTIONS.CASE_REGISTRATION_MANUAL,
      metadata: notes ? JSON.stringify({ notes, marked_by: authResult.user.userId, marked_at: new Date().toISOString() }) : null
    });

    // Update case status and fees
    case_.status = 'waiting_for_action';
    case_.fees_paid = paymentAmount;
    await case_.save();

    // Fetch the updated case with joined user fields for logging
    const caseWithUser = await Case.findOne({
      where: { id: case_.id },
      attributes: {
        include: [
          [col('user.name'), 'user_name'],
          [col('user.email'), 'user_email']
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: []
        }
      ]
    });

    const caseData = caseWithUser?.toJSON ? caseWithUser.toJSON() : caseWithUser;
    const transformedCase = {
      ...caseData,
      id: case_.id,
      case_number: case_.case_number,
      title: case_.title,
      case_type: case_.case_type,
      user: caseData?.user_name ? { name: caseData.user_name } : null
    };

    // Log activity
    await logCaseCreated(transformedCase, authResult.user.userId);

    return NextResponse.json({
      success: true,
      message: PAYMENT_CONSTANTS.SUCCESS.PAYMENT_MARKED_PAID,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status
        },
        case: {
          id: case_.id,
          case_number: case_.case_number,
          title: case_.title,
          status: case_.status
        }
      }
    });

  } catch (error: any) {
    console.error('Mark payment as paid error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Failed to mark payment as paid' },
      { status: 500 }
    );
  }
}

