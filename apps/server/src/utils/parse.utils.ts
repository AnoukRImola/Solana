import * as borsh from '@project-serum/borsh'
import { PublicKey } from '@solana/web3.js'
import BN from 'bn.js'
import { Structure } from 'buffer-layout.types'
import { Escrow } from 'src/interfaces/escrow.interface'
import type { Milestone } from 'src/interfaces/milestone.interface'
import type { EscrowDto } from '../solana-contract/escrow/Dto/escrow.dto'

// Define the Borsh schema for the Milestone struct
const milestoneSchema = borsh.struct([
	borsh.str('description'),
	borsh.str('status'), // Assuming status is stored as a string on-chain
	borsh.bool('approved_flag'),
	// Add other fields if they exist in the Rust struct (e.g., evidence, timestamps)... ask for later
	// borsh.option(borsh.str(), 'evidence'), // Example if evidence is optional string
	// borsh.option(borsh.i64(), 'approvedAt'), // Example if approvedAt is optional timestamp (i64)
	// borsh.option(borsh.i64(), 'completedAt'), // Example if completedAt is optional timestamp (i64)
])

// Define the Borsh schema for the Escrow struct
// NOTE: Adjust field types (e.g., u64, u128) based on the actual Rust struct definition. For now assuming some initial values
// TODO: Improve structure generic to accept a created interface to return such data type when encrypting/decrypting
const escrowSchema: Structure = borsh.struct([
	borsh.str('engagementId'),
	borsh.str('title'),
	borsh.str('description'),
	borsh.publicKey('approver'),
	borsh.publicKey('serviceProvider'),
	borsh.publicKey('platformAddress'),
	borsh.u128('amount'), // Use u128 or u64 as appropriate
	borsh.u128('platformFee'), // Use u128 or u64 as appropriate
	borsh.vec(milestoneSchema, 'milestones'),
	borsh.publicKey('releaseSigner'),
	borsh.publicKey('disputeResolver'),
	borsh.publicKey('trustline'), // Assuming this is the token mint address
	borsh.u8('trustlineDecimals'),
	borsh.publicKey('receiver'),
	borsh.u64('receiverMemo'), // Use u64 or another appropriate type
	borsh.bool('disputeFlag'),
	borsh.bool('releaseFlag'),
	borsh.bool('resolvedFlag'),
	// Add other fields if they exist in the Rust struct (e.g., balance, funds)
	// borsh.u128('balance'), // Example
	// borsh.u128('approverFunds'), // Example
	// borsh.u128('receiverFunds'), // Example
])

/**
 * Serializes Escrow data using the Borsh schema.
 * @param escrow - The Escrow data transfer object.
 * @returns A buffer containing the serialized data.
 */
export function serializeEscrow(escrow: EscrowDto): Buffer {
	const value = {
		...escrow,
		approver: new PublicKey(escrow.approver),
		serviceProvider: new PublicKey(escrow.serviceProvider),
		platformAddress: new PublicKey(escrow.platformAddress),
		amount: new BN(escrow.amount), // Assuming amount is u128 or similar requiring BN
		platformFee: new BN(escrow.platformFee), // Assuming platformFee is u128 or similar requiring BN
		milestones: escrow.milestones.map((m) => ({
			...m,
			// Ensure milestone fields match the schema definition
		})),
		releaseSigner: new PublicKey(escrow.releaseSigner),
		disputeResolver: new PublicKey(escrow.disputeResolver),
		trustline: new PublicKey(escrow.trustline),
		receiver: new PublicKey(escrow.receiver),
		receiverMemo: new BN(escrow.receiverMemo), // Assuming receiverMemo is u64 or similar
		// Map other fields as necessary (e.g., flags are already boolean)
	}
	// TODO: Check custom type declaration...
	return Buffer.from(escrowSchema.encode(value))
}

/**
 * Deserializes Escrow data from a buffer using the Borsh schema.
 * @param buffer - The buffer containing the serialized Escrow data.
 * @returns The deserialized Escrow object.
 */
export function deserializeEscrow(buffer: Buffer): Record<string, unknown> {
	// Consider creating a specific return type
	const decoded = escrowSchema.decode(buffer)

	// Convert PublicKeys and BNs back to strings or numbers as needed for DTO/interface compatibility
	return {
		...decoded,
		approver: decoded.approver.toBase58(),
		serviceProvider: decoded.serviceProvider.toBase58(),
		platformAddress: decoded.platformAddress.toBase58(),
		amount: decoded.amount.toString(),
		platformFee: decoded.platformFee.toString(),
		milestones: decoded.milestones.map((m) => ({
			...m,
			// Convert milestone fields if necessary
		})),
		releaseSigner: decoded.releaseSigner.toBase58(),
		disputeResolver: decoded.disputeResolver.toBase58(),
		trustline: decoded.trustline.toBase58(),
		receiver: decoded.receiver.toBase58(),
		receiverMemo: decoded.receiverMemo.toNumber(), // Or toString() if it exceeds JS number limits
	}
}

/**
 * Converts a human-readable token amount to its smallest unit (lamports equivalent).
 * @param amount - The amount in human-readable format (e.g., "10.5").
 * @param decimals - The number of decimal places for the token.
 * @returns A BN instance representing the amount in the smallest unit.
 */
export function toSmallestUnit(amount: string, decimals: number): BN {
	const [integerPart, fractionalPart = ''] = amount.split('.')
	const paddedFractionalPart = fractionalPart
		.padEnd(decimals, '0')
		.slice(0, decimals)
	const combined = integerPart + paddedFractionalPart
	return new BN(combined)
}

/**
 * Converts an amount from its smallest unit back to a human-readable format.
 * @param smallestUnitAmount - The amount in the smallest unit (as BN).
 * @param decimals - The number of decimal places for the token.
 * @returns A string representing the human-readable amount.
 */
export function fromSmallestUnit(
	smallestUnitAmount: BN,
	decimals: number,
): string {
	const amountStr = smallestUnitAmount.toString().padStart(decimals + 1, '0')
	const integerPart = amountStr.slice(0, -decimals)
	const fractionalPart = amountStr.slice(-decimals).replace(/0+$/, '') // Remove trailing zeros
	return fractionalPart ? `${integerPart}.${fractionalPart}` : integerPart
}
