/**
 * Fee calculation based on Domestic Mediation & Conciliation – Fee Structure (Fees page).
 * Administration Charge is payable at case registration; then 18% GST is added.
 * Final amount = administration charge (base fee) + 18% GST (i.e. baseFee * 1.18).
 */

const GST_RATE = 0.18;

/** Domestic Mediation & Conciliation – Administration Charge tiers (INR). */
const FEE_TIERS: { maxAmount: number; baseFee: number }[] = [
  { maxAmount: 200000, baseFee: 3000 },       // Tier 1: Disputes up to ₹2,00,000 → ₹3,000
  { maxAmount: 2500000, baseFee: 4500 },     // Tier 2: Above ₹2,00,000 up to ₹25,00,000 → ₹4,500
  { maxAmount: Infinity, baseFee: 9500 },     // Tier 3: Above ₹25,00,000 → ₹9,500
];

export function calculateBaseFeeFromDisputeAmount(amountInr: number): number {
  if (!amountInr || amountInr <= 0) return 0;
  const amt = Math.floor(amountInr);
  for (const tier of FEE_TIERS) {
    if (amt <= tier.maxAmount) {
      return Math.round(tier.baseFee * 100) / 100;
    }
  }
  return 9500;
}

export function calculateFeeWithGst(disputeAmountInr: number): { baseFee: number; gst: number; total: number } {
  const baseFee = calculateBaseFeeFromDisputeAmount(disputeAmountInr);
  const gst = Math.round(baseFee * GST_RATE * 100) / 100;
  const total = Math.round((baseFee + gst) * 100) / 100;
  return { baseFee, gst, total };
}
