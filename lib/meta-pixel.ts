/**
 * Meta Pixel utility functions for tracking custom events
 * Use these functions to track specific user actions for Meta ads optimization
 */

/**
 * Track a custom event with Meta Pixel
 * @param eventName - The name of the event (e.g., 'Lead', 'Purchase', 'CompleteRegistration')
 * @param eventData - Optional event parameters (e.g., { value: 100, currency: 'USD' })
 */
export function trackMetaPixelEvent(eventName: string, eventData?: Record<string, any>) {
  if (typeof window === 'undefined') return;

  const fbq = (window as any).fbq;
  if (!fbq) {
    console.warn('Meta Pixel not initialized. Make sure MetaPixel component is loaded.');
    return;
  }

  if (eventData) {
    fbq('track', eventName, eventData);
  } else {
    fbq('track', eventName);
  }
}

/**
 * Track a PageView event (usually handled automatically, but can be used for SPA navigation)
 */
export function trackPageView() {
  trackMetaPixelEvent('PageView');
}

/**
 * Track a Lead event - when a user submits a form or shows interest
 * @param value - Optional monetary value of the lead
 * @param currency - Currency code (default: 'INR')
 */
export function trackLead(value?: number, currency: string = 'INR') {
  trackMetaPixelEvent('Lead', value ? { value, currency } : undefined);
}

/**
 * Track a CompleteRegistration event - when a user completes registration
 * @param value - Optional monetary value
 * @param currency - Currency code (default: 'INR')
 */
export function trackCompleteRegistration(value?: number, currency: string = 'INR') {
  trackMetaPixelEvent('CompleteRegistration', value ? { value, currency } : undefined);
}

/**
 * Track a Purchase event - when a user makes a purchase
 * @param value - Purchase amount
 * @param currency - Currency code (default: 'INR')
 * @param contentIds - Array of product/content IDs
 */
export function trackPurchase(value: number, currency: string = 'INR', contentIds?: string[]) {
  trackMetaPixelEvent('Purchase', {
    value,
    currency,
    ...(contentIds && { content_ids: contentIds }),
  });
}

/**
 * Track an InitiateCheckout event - when a user starts checkout
 * @param value - Optional checkout value
 * @param currency - Currency code (default: 'INR')
 */
export function trackInitiateCheckout(value?: number, currency: string = 'INR') {
  trackMetaPixelEvent('InitiateCheckout', value ? { value, currency } : undefined);
}

/**
 * Track a ViewContent event - when a user views specific content
 * @param contentName - Name of the content
 * @param contentCategory - Category of the content
 * @param value - Optional value
 * @param currency - Currency code (default: 'INR')
 */
export function trackViewContent(
  contentName: string,
  contentCategory?: string,
  value?: number,
  currency: string = 'INR'
) {
  trackMetaPixelEvent('ViewContent', {
    content_name: contentName,
    ...(contentCategory && { content_category: contentCategory }),
    ...(value && { value, currency }),
  });
}

/**
 * Track a Contact event - when a user contacts you
 */
export function trackContact() {
  trackMetaPixelEvent('Contact');
}

/**
 * Track a CaseCreated event - custom event for when a user creates a case
 * @param caseId - The case ID
 * @param caseType - Type of case
 * @param value - Optional case value
 */
export function trackCaseCreated(caseId: string | number, caseType?: string, value?: number) {
  trackMetaPixelEvent('CaseCreated', {
    case_id: String(caseId),
    ...(caseType && { case_type: caseType }),
    ...(value && { value, currency: 'INR' }),
  });
}

/**
 * Track a PaymentCompleted event - custom event for when payment is completed
 * @param caseId - The case ID
 * @param value - Payment amount
 * @param currency - Currency code (default: 'INR')
 */
export function trackPaymentCompleted(caseId: string | number, value: number, currency: string = 'INR') {
  trackMetaPixelEvent('PaymentCompleted', {
    case_id: String(caseId),
    value,
    currency,
  });
}
