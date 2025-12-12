import { NextRequest, NextResponse } from 'next/server';
const crypto = require('crypto');
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

    const body = await request.json();
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.MISSING_PAYMENT_DATA },
        { status: 400 }
      );
    }

    // Find payment record
    const payment = await Payment.findOne({
      where: {
        razorpay_order_id,
        user_id: authResult.user.userId
      },
      include: [
        {
          model: Case,
          as: 'case',
          required: false
        }
      ]
    });

    if (!payment) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.PAYMENT_NOT_FOUND },
        { status: 404 }
      );
    }

    // Verify signature
    const text = `${razorpay_order_id}|${razorpay_payment_id}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(text)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      // Mark payment as failed
      payment.razorpay_payment_id = razorpay_payment_id;
      payment.status = PAYMENT_CONSTANTS.STATUS.FAILED;
      await payment.save();
      
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.INVALID_SIGNATURE },
        { status: 400 }
      );
    }

    // Update payment record
    payment.razorpay_payment_id = razorpay_payment_id;
    payment.razorpay_signature = razorpay_signature;
    payment.status = PAYMENT_CONSTANTS.STATUS.COMPLETED;
    await payment.save();

    // Update existing draft case or handle payment without case
    let updatedCase = null;
    if (payment.case_id) {
      try {
        // Find the draft case
        updatedCase = await Case.findByPk(payment.case_id);
        
        if (updatedCase && updatedCase.status === 'pending_payment') {
          // Update case status to waiting_for_action and mark fees as paid
          updatedCase.status = 'waiting_for_action';
          updatedCase.fees_paid = payment.amount;
          await updatedCase.save();

          // Fetch the updated case with joined user fields for logging
          const caseWithUser = await Case.findOne({
            where: { id: updatedCase.id },
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
            id: updatedCase.id,
            case_number: updatedCase.case_number,
            title: updatedCase.title,
            case_type: updatedCase.case_type,
            user: caseData?.user_name ? { name: caseData.user_name } : null
          };

          // Log activity
          await logCaseCreated(transformedCase, authResult.user.userId);
        } else {
          return NextResponse.json({
            success: false,
            message: 'Case not found or payment already processed'
          }, { status: 404 });
        }
      } catch (caseError: any) {
        console.error('Case update error after payment:', caseError);
        // Payment is verified but case update failed
        return NextResponse.json({
          success: true,
          message: 'Payment verified successfully but case update failed',
          payment_verified: true,
          case_updated: false,
          error: caseError?.message
        }, { status: 500 });
      }
    }

    return NextResponse.json({
      success: true,
      message: PAYMENT_CONSTANTS.SUCCESS.PAYMENT_VERIFIED,
      data: {
        payment: {
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          razorpay_order_id: payment.razorpay_order_id,
          razorpay_payment_id: payment.razorpay_payment_id
        },
        case: updatedCase ? {
          id: updatedCase.id,
          case_number: updatedCase.case_number,
          title: updatedCase.title
        } : null
      }
    });

  } catch (error: any) {
    console.error('Verify payment error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || PAYMENT_CONSTANTS.ERRORS.VERIFICATION_FAILED },
      { status: 500 }
    );
  }
}

