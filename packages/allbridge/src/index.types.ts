import type { Connection, Keypair } from '@solana/web3.js'

export interface SolanaConfig {
	connection: Connection
	payer: Keypair
}
