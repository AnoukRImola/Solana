// TODO: PR5 — This utility was Stellar-specific (ScVal encoding).
// For Solana/Anchor, u128 values are handled natively by Borsh serialization.

export function u128ToBytes(value: string): Buffer {
	const bn = BigInt(value)
	const buf = Buffer.alloc(16)
	for (let i = 0; i < 16; i++) {
		buf[i] = Number((bn >> BigInt(i * 8)) & BigInt(0xff))
	}
	return buf
}
