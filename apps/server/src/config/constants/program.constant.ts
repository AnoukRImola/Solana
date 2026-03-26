import { AnchorProvider, Program, Wallet } from '@coral-xyz/anchor'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { EscrowIDL, type Escrow } from '@programs/solana-tl'
import { apiConfig } from '../api.config'

let _connection: Connection | null = null
let _program: Program<Escrow> | null = null

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
