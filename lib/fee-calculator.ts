/**
 * Fee calculation based on Fees page structure (INR).
 * - Mediation: Used for case registration (2-15L and 15L+ tiers).
 * - Arbitration: Alternative structure for arbitration cases.
 * Final amount = base fee + 18% GST (i.e. baseFee * 1.18).
 */

const GST_RATE = 0.18;

/** Mediation fee tiers (INR): up to 2L, 2-15L, 15L+ */
const MEDIATION_FEE_TIERS: { maxAmount: number; baseFee: number }[] = [
  { maxAmount: 200000, baseFee: 3000 },
  { maxAmount: 1500000, baseFee: 4500 },
  { maxAmount: Infinity, baseFee: 9500 },
];

/** Arbitration fee tiers (INR): max amount (inclusive), base fee, [percent on excess above threshold]. */
const FEE_TIERS: { maxAmount: number; baseFee: number; percent?: number; threshold?: number }[] = [
  { maxAmount: 100000, baseFee: 4500 },
  { maxAmount: 500000, baseFee: 18000 },
  { maxAmount: 2500000, baseFee: 18000, percent: 3, threshold: 500000 },
  { maxAmount: 5000000, baseFee: 72000, percent: 2, threshold: 2500000 },
  { maxAmount: 10000000, baseFee: 117000, percent: 1, threshold: 5000000 },
  { maxAmount: 50000000, baseFee: 162000, percent: 0.75, threshold: 10000000 },
  { maxAmount: 100000000, baseFee: 432000, percent: 0.6, threshold: 50000000 },
  { maxAmount: 200000000, baseFee: 702000, percent: 0.5, threshold: 100000000 },
  { maxAmount: Infinity, baseFee: 3000000 }, // cap as per Fees page
];

export function calculateBaseFeeFromDisputeAmount(amountInr: number): number {
  if (!amountInr || amountInr <= 0) return 0;
  const amt = Math.floor(amountInr);
  for (const tier of FEE_TIERS) {
    if (amt <= tier.maxAmount) {
      let base = tier.baseFee;
      if (tier.percent != null && tier.threshold != null && amt > tier.threshold) {
        base += (amt - tier.threshold) * (tier.percent / 100);
      }
      return Math.round(base * 100) / 100;
    }
  }
  return 3000000;
}

export function calculateFeeWithGst(disputeAmountInr: number): { baseFee: number; gst: number; total: number } {
  const baseFee = calculateBaseFeeFromDisputeAmount(disputeAmountInr);
  const gst = Math.round(baseFee * GST_RATE * 100) / 100;
  const total = Math.round((baseFee + gst) * 100) / 100;
  return { baseFee, gst, total };
}

/**
 * Mediation fee calculation (2-15L and 15L+ tiers).
 * Tier 1: Up to ₹2,00,000 - ₹3,000
 * Tier 2: ₹2,00,000 to ₹15,00,000 - ₹4,500
 * Tier 3: Above ₹15,00,000 - ₹9,500
 */
export function calculateMediationBaseFee(disputeAmountInr: number): number {
  if (!disputeAmountInr || disputeAmountInr <= 0) return 3000;
  const amt = Math.floor(disputeAmountInr);
  for (const tier of MEDIATION_FEE_TIERS) {
    if (amt <= tier.maxAmount) {
      return tier.baseFee;
    }
  }
  return 9500;
}

export function calculateMediationFeeWithGst(disputeAmountInr: number): { baseFee: number; gst: number; total: number } {
  const baseFee = calculateMediationBaseFee(disputeAmountInr);
  const gst = Math.round(baseFee * GST_RATE * 100) / 100;
  const total = Math.round((baseFee + gst) * 100) / 100;
  return { baseFee, gst, total };
}
