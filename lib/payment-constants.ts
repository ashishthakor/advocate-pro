// Payment-related constants

export const PAYMENT_CONSTANTS = {
  // Payment amounts
  CASE_REGISTRATION_FEE: 3000,
  
  // Payment statuses
  STATUS: {
    PENDING: 'pending',
    COMPLETED: 'completed',
    FAILED: 'failed',
    REFUNDED: 'refunded',
  },
  
  // Payment methods
  METHOD: {
    RAZORPAY: 'razorpay',
    MANUAL: 'manual',
  },
  
  // Currency
  CURRENCY: 'INR',
  
  // Payment descriptions
  DESCRIPTIONS: {
    CASE_REGISTRATION: 'Case Registration Fee',
    CASE_REGISTRATION_MANUAL: 'Case Registration Fee (Manually Marked)',
  },
  
  // Razorpay script URL
  RAZORPAY_SCRIPT_URL: 'https://checkout.razorpay.com/v1/checkout.js',
  
  // Error messages
  ERRORS: {
    LOAD_SCRIPT_FAILED: 'Failed to load payment gateway. Please refresh the page.',
    PAYMENT_FAILED: 'Payment failed. Please try again.',
    VERIFICATION_FAILED: 'Payment verification failed. Please contact support.',
    ORDER_CREATION_FAILED: 'Failed to create payment order',
    INVALID_AMOUNT: 'Invalid payment amount. Case registration fee is ₹3000',
    CASE_NOT_FOUND: 'Case not found or payment already completed',
    UNAUTHORIZED: 'Unauthorized',
    ONLY_USERS: 'Only users can create payment orders',
    ONLY_ADMINS: 'Only admins can manually mark payments',
    CASE_ID_REQUIRED: 'Case ID is required',
    CASE_NOT_PENDING: 'Case is not in pending payment status',
    MISSING_PAYMENT_DATA: 'Missing payment verification data',
    INVALID_SIGNATURE: 'Invalid payment signature',
    PAYMENT_NOT_FOUND: 'Payment record not found',
    USER_NOT_FOUND: 'User not found',
  },
  
  // Success messages
  SUCCESS: {
    PAYMENT_VERIFIED: 'Payment verified successfully',
    PAYMENT_MARKED_PAID: 'Payment marked as paid successfully',
    WEBHOOK_PROCESSED: 'Webhook processed',
  },
  
  // Webhook events
  WEBHOOK_EVENTS: {
    PAYMENT_CAPTURED: 'payment.captured',
    PAYMENT_AUTHORIZED: 'payment.authorized',
    PAYMENT_FAILED: 'payment.failed',
  },
} as const;

