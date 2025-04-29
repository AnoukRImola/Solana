import type { SolanaConfig } from './index.types'

export const allbridge = {
	getConnection(config: SolanaConfig) {
		return config.connection
	},
	getPayer(config: SolanaConfig) {
		return config.payer
	},
}
