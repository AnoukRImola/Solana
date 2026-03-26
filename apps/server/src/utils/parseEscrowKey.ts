import { microUSDTToDecimal } from 'src/utils/parse.utils'

// TODO: PR5 — Rewrite escrow key parsing for Anchor account deserialization
// The Stellar-based ScVal parsing has been removed.
// Anchor provides automatic deserialization via program.account.escrowData.fetch()

export function handleKey(
	key: string,
	val: any,
	parsed: Record<string, any>,
	trustlineDecimals: number,
) {
	// Placeholder — will be replaced by Anchor IDL-based deserialization in PR5
	console.warn(`handleKey called for key "${key}" but Stellar parsing has been removed.`)
}
