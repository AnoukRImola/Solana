import * as borsh from '@project-serum/borsh'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { Structure } from 'buffer-layout.types'
import { EscrowStructure } from 'src/interfaces/escrow.interface'
import type { EscrowDto } from '../solana-contract/escrow/Dto/escrow.dto'

// Define the Borsh schema for the Milestone struct
const milestoneSchema = borsh.struct([
	borsh.bool('approved_flag'),
	borsh.str('description'),
	borsh.str('evidence'),
	borsh.str('status'), // Assuming status is stored as a string on-chain
])

// Define the Borsh schema for the SwapData struct
const swapDataSchema = borsh.struct([
	borsh.u128('originalAmount'),
	borsh.str('originalCurrency'),
	borsh.u128('tokenAmount'),
	borsh.str('tokenCurrency'),
	borsh.str('conversionTxHash'),
	borsh.u128('conversionRate'),
	borsh.u64('conversionTimestamp'), // Assuming conversionTimestamp is a u64
])

// Define the Borsh schema for the Escrow struct
// NOTE: Adjust field types (e.g., u64, u128) based on the actual Rust struct definition. For now assuming some initial values
// TODO: Improve structure generic to accept a created interface to return such data type when encrypting/decrypting
const escrowSchema: Structure<EscrowStructure> = borsh.struct([
	borsh.str('engagementId'),
	borsh.str('title'),
	borsh.str('description'),
	borsh.str('amount'),
	borsh.publicKey('approver'),
	borsh.publicKey('serviceProvider'),
	borsh.publicKey('platformAddress'),
	borsh.i128('platformFee'), // Use u128 or u64 as appropriate
	borsh.publicKey('releaseSigner'),
	borsh.publicKey('disputeResolver'),
	borsh.publicKey('trustline'), // Assuming this is the token mint address
	borsh.publicKey('receiver'),
	borsh.i128('trustlineDecimals'),
	borsh.u64('receiverMemo'), // Use u64 or another appropriate type
	borsh.bool('disputeFlag'),
	borsh.bool('releaseFlag'),
	borsh.bool('resolvedFlag'),
	borsh.str('contractId'),
	borsh.vec(milestoneSchema, 'milestones'),
	borsh.vec(swapDataSchema, 'swapData'),
])

/**
 * Serializes Escrow data using the Borsh schema.
 * @param escrow - The Escrow data transfer object.
 * @returns A buffer containing the serialized data.
 */
export function serializeEscrow(escrow: EscrowDto): Buffer {
	const { amount: price, trustlineDecimals: decimals } = escrow

	const value: EscrowStructure = {
		...escrow,
		amount: adjustPricesToMicroUSDC({ price, decimals }),
		approver: new PublicKey(escrow.approver),
		serviceProvider: new PublicKey(escrow.serviceProvider),
		platformAddress: new PublicKey(escrow.platformAddress),
		platformFee: new BN(escrow.platformFee), // Assuming platformFee is u128 or similar requiring BN
		releaseSigner: new PublicKey(escrow.releaseSigner),
		disputeResolver: new PublicKey(escrow.disputeResolver),
		trustline: new PublicKey(escrow.trustline),
		receiver: new PublicKey(escrow.receiver),
		receiverMemo: new BN(escrow.receiverMemo), // Assuming receiverMemo is u64 or similar
	}

	const buffer = Buffer.alloc(escrowSchema.getSpan(value))
	escrowSchema.encode(value, buffer)
	return buffer
}

/**
 * Deserializes Escrow data from a buffer using the Borsh schema.
 * @param buffer - The buffer containing the serialized Escrow data.
 * @returns The deserialized Escrow object.
 */
export function deserializeEscrow(buffer: Buffer): EscrowDto {
	// Consider creating a specific return type
	const decoded = escrowSchema.decode(buffer)

	// Convert PublicKeys and BNs back to strings or numbers as needed for DTO/interface compatibility
	return {
		...decoded,
		approver: decoded.approver.toBase58(),
		serviceProvider: decoded.serviceProvider.toBase58(),
		platformAddress: decoded.platformAddress.toBase58(),
		amount: decoded.amount,
		platformFee: decoded.platformFee.toString(),
		releaseSigner: decoded.releaseSigner.toBase58(),
		disputeResolver: decoded.disputeResolver.toBase58(),
		trustline: decoded.trustline.toBase58(),
		receiver: decoded.receiver.toBase58(),
		receiverMemo: decoded.receiverMemo,
	}
}

export function adjustPricesToMicroUSDC({
	price,
	decimals,
}: {
	price: string
	decimals: number
}) {
	const microStable = BigInt(
		Math.round(Number.parseFloat(price.toString()) * decimals),
	)
	return microStable.toString()
}

export function microUSDTToDecimal({
	microToken,
	decimals,
}: {
	microToken: bigint | number
	decimals: number
}) {
	return Number(microToken) / decimals
}
