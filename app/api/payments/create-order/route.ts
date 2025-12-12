import { NextRequest, NextResponse } from 'next/server';
const Razorpay = require('razorpay');
const { Payment, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { PAYMENT_CONSTANTS } from '@/lib/payment-constants';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || '',
});

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.UNAUTHORIZED },
        { status: 401 }
      );
    }

    // Only users can create payment orders for case registration
    if (authResult.user.role !== 'user') {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.ONLY_USERS },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { amount, description, case_id } = body;

    // If case_id is provided, verify it exists and belongs to the user
    let existingCase = null;
    if (case_id) {
      const { Case } = require('@/models/init-models');
      existingCase = await Case.findOne({
        where: {
          id: case_id,
          user_id: authResult.user.userId,
          status: 'pending_payment'
        }
      });

      if (!existingCase) {
        return NextResponse.json(
          { success: false, message: PAYMENT_CONSTANTS.ERRORS.CASE_NOT_FOUND },
          { status: 404 }
        );
      }
    }

    // Determine payment amount: use custom fees from case if set, otherwise use provided amount or default
    let paymentAmount = PAYMENT_CONSTANTS.CASE_REGISTRATION_FEE;
    if (existingCase && existingCase.fees && parseFloat(existingCase.fees) > 0) {
      // Use custom fees from case if set
      paymentAmount = parseFloat(existingCase.fees);
    } else if (amount && parseFloat(amount) > 0) {
      // Use provided amount if no custom fees
      paymentAmount = parseFloat(amount);
    }

    // Validate amount is positive
    if (paymentAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Payment amount must be greater than 0' },
        { status: 400 }
      );
    }

    // Get user details
    const user = await User.findByPk(authResult.user.userId);
    if (!user) {
      return NextResponse.json(
        { success: false, message: PAYMENT_CONSTANTS.ERRORS.USER_NOT_FOUND },
        { status: 404 }
      );
    }

    // Create Razorpay order
    const receiptId = existingCase 
      ? `case_${existingCase.id}_${Date.now()}` 
      : `case_reg_${Date.now()}_${authResult.user.userId}`;
    
    const options = {
      amount: paymentAmount * 100, // Razorpay expects amount in paise (smallest currency unit)
      currency: PAYMENT_CONSTANTS.CURRENCY,
      receipt: receiptId,
      notes: {
        user_id: authResult.user.userId.toString(),
        description: description || PAYMENT_CONSTANTS.DESCRIPTIONS.CASE_REGISTRATION,
        case_id: existingCase ? existingCase.id.toString() : null
      }
    };

    const razorpayOrder = await razorpay.orders.create(options);

    // Create payment record in database
    const payment = await Payment.create({
      user_id: authResult.user.userId,
      case_id: existingCase ? existingCase.id : null, // Link to existing draft case if provided
      razorpay_order_id: razorpayOrder.id,
      razorpay_payment_id: null,
      razorpay_signature: null,
      amount: paymentAmount,
      currency: PAYMENT_CONSTANTS.CURRENCY,
      status: PAYMENT_CONSTANTS.STATUS.PENDING,
      payment_description: description || PAYMENT_CONSTANTS.DESCRIPTIONS.CASE_REGISTRATION,
      metadata: existingCase ? JSON.stringify({ case_id: existingCase.id }) : null
    });

    return NextResponse.json({
      success: true,
      data: {
        order_id: razorpayOrder.id,
        amount: razorpayOrder.amount, // Amount in paise (smallest currency unit)
        currency: razorpayOrder.currency,
        key_id: process.env.RAZORPAY_KEY_ID,
        payment_id: payment.id,
        name: user.name || 'User',
        email: user.email,
        contact: user.phone || '',
        description: description || PAYMENT_CONSTANTS.DESCRIPTIONS.CASE_REGISTRATION
      }
    });

  } catch (error: any) {
    console.error('Create payment order error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || PAYMENT_CONSTANTS.ERRORS.ORDER_CREATION_FAILED },
      { status: 500 }
    );
  }
}

