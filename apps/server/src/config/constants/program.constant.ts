import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { type Escrow, EscrowIDL } from '@programs/solana-tl'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { apiConfig } from '../api.config'

let _connection: Connection | null = null
let _program: Program<Escrow> | null = null
let _serverKeypair: Keypair | null = null

export function getServerKeypair(): Keypair {
	if (!_serverKeypair) {
		const raw = apiConfig.solanaPayerSecretKeyJSON
		if (!raw) {
			throw new Error(
				'SOLANA_PAYER_SECRET_KEY_JSON environment variable is required',
			)
		}
		const secretKey = Uint8Array.from(JSON.parse(raw))
		_serverKeypair = Keypair.fromSecretKey(secretKey)
	}
	return _serverKeypair
}

export function getConnection(): Connection {
	if (!_connection) {
		_connection = new Connection(apiConfig.solanaServerURL, 'confirmed')
	}
	return _connection
}

export function getProgram(): Program<Escrow> {
	if (!_program) {
		const connection = getConnection()
		const dummyWallet = new Wallet(Keypair.generate())
		const provider = new AnchorProvider(connection, dummyWallet, {
			commitment: 'confirmed',
		})
		_program = new Program(EscrowIDL as any, provider) as Program<Escrow>
	}
	return _program
}

export function getProgramId(): PublicKey {
	return getProgram().programId
}

export function deriveEscrowPda(engagementId: string): [PublicKey, number] {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('escrow'), Buffer.from(engagementId)],
		getProgramId(),
	)
}

export function deriveMultiReleaseEscrowPda(
	engagementId: string,
): [PublicKey, number] {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('multi_escrow'), Buffer.from(engagementId)],
		getProgramId(),
	)
}

export function deriveComplianceRegistryPda(): [PublicKey, number] {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('compliance_registry')],
		getProgramId(),
	)
}

export function deriveKycPda(address: PublicKey): [PublicKey, number] {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('kyc'), address.toBuffer()],
		getProgramId(),
	)
}

export function deriveEscrowCompliancePda(
	escrowAddress: PublicKey,
): [PublicKey, number] {
	return PublicKey.findProgramAddressSync(
		[Buffer.from('escrow_compliance'), escrowAddress.toBuffer()],
		getProgramId(),
	)
}
