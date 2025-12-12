import { NextRequest, NextResponse } from 'next/server';
const crypto = require('crypto');
const { Payment, Case } = require('@/models/init-models');
import { PAYMENT_CONSTANTS } from '@/lib/payment-constants';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { event, payload } = body;

    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || '';
    const signature = request.headers.get('x-razorpay-signature') || '';
    
    if (webhookSecret && signature) {
      const text = JSON.stringify(body);
      const generatedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(text)
        .digest('hex');

      if (generatedSignature !== signature) {
        return NextResponse.json(
          { success: false, message: 'Invalid webhook signature' },
          { status: 401 }
        );
      }
    }

    // Handle payment events
    if (event === PAYMENT_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_CAPTURED || event === PAYMENT_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_AUTHORIZED) {
      const paymentEntity = payload.payment?.entity || payload.payment;
      const orderEntity = payload.order?.entity || payload.order;

      if (paymentEntity && orderEntity) {
        const payment = await Payment.findOne({
          where: {
            razorpay_order_id: orderEntity.id
          }
        });

        if (payment && payment.status === PAYMENT_CONSTANTS.STATUS.PENDING) {
          payment.razorpay_payment_id = paymentEntity.id;
          payment.status = PAYMENT_CONSTANTS.STATUS.COMPLETED;
          payment.payment_method = paymentEntity.method || null;
          await payment.save();

          // Update case status if case exists
          if (payment.case_id) {
            const case_ = await Case.findByPk(payment.case_id);
            if (case_ && case_.status === 'pending_payment') {
              case_.status = 'waiting_for_action';
              case_.fees_paid = payment.amount;
              await case_.save();
            }
          }
        }
      }
    } else if (event === PAYMENT_CONSTANTS.WEBHOOK_EVENTS.PAYMENT_FAILED) {
      const paymentEntity = payload.payment?.entity || payload.payment;
      const orderEntity = payload.order?.entity || payload.order;

      if (paymentEntity && orderEntity) {
        const payment = await Payment.findOne({
          where: {
            razorpay_order_id: orderEntity.id
          }
        });

        if (payment) {
          payment.status = PAYMENT_CONSTANTS.STATUS.FAILED;
          payment.razorpay_payment_id = paymentEntity.id || null;
          await payment.save();
        }
      }
    }

    return NextResponse.json({ success: true, message: PAYMENT_CONSTANTS.SUCCESS.WEBHOOK_PROCESSED });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

