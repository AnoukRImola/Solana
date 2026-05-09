/**
 * Converts a human-readable amount to micro units (e.g., 1.5 USDC → 1500000).
 */
export function adjustPricesToMicroUSDC({
  price,
  decimals,
}: {
  price: string;
  decimals: number;
}) {
  const multiplier = 10 ** decimals;
  const microStable = BigInt(
    Math.round(Number.parseFloat(price.toString()) * multiplier),
  );
  return microStable.toString();
}

/**
 * Converts micro units back to a human-readable decimal (e.g., 1500000 → 1.5).
 */
export function microUSDTToDecimal({
  microToken,
  decimals,
}: {
  microToken: bigint | number;
  decimals: number;
}) {
  const multiplier = 10 ** decimals;
  return Number(microToken) / multiplier;
}
