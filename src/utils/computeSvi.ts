export function calculateSVI({ press_60d = 0, rfp_60d = 0 }) {
  const PRESS_WEIGHT = 0.4;
  const RFP_WEIGHT = 0.6;

  const svi = press_60d * PRESS_WEIGHT + rfp_60d * RFP_WEIGHT;

  return Number(svi.toFixed(2)); // clean 2-decimal output
}
