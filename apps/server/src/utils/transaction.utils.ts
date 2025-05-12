import { HttpException, HttpStatus } from '@nestjs/common'
import {
	Commitment,
	Connection,
	ConnectionConfig,
	Keypair,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionInstruction,
	sendAndConfirmTransaction,
} from '@solana/web3.js'

export async function buildTransaction({
	account,
	operations,
	connection,
	options = 'confirmed',
}: {
	account: PublicKey
	operations: TransactionInstruction[]
	connection: Connection
	options?: Commitment | ConnectionConfig
}) {
	const recentBlockhash = await connection.getLatestBlockhash(options)

	if (!recentBlockhash) throw new Error('Failed to get recent blockhash')

	const feePayer = account
	const transaction = new Transaction({
		recentBlockhash: recentBlockhash.blockhash,
		feePayer, // The 'account' parameter is used as the feePayer for the Solana transaction.
	})

	for (const instruction of operations) {
		transaction.add(instruction)
	}

	return transaction
}

export function buildInvokeContractInstruction({
	programId,
	escrowAccount,
	payer,
	data,
	additionalAccounts = [],
}: {
	programId: PublicKey
	escrowAccount: PublicKey
	payer: PublicKey
	data: Buffer
	additionalAccounts?: Array<{
		pubkey: PublicKey
		isSigner: boolean
		isWritable: boolean
	}>
}): TransactionInstruction {
	// Create the account metadata array, starting with required accounts
	const keys = [
		{ pubkey: escrowAccount, isSigner: true, isWritable: true },
		{ pubkey: payer, isSigner: true, isWritable: true },
		{ pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
	]

	// Add any additional accounts if provided
	if (additionalAccounts?.length) {
		keys.push(...additionalAccounts)
	}

	// Create and return the transaction instruction
	return new TransactionInstruction({
		keys,
		programId,
		data,
	})
}

export async function signAndSendTransaction({
	transaction,
	signer,
	connection,
}: {
	transaction: Transaction
	signer: Keypair
	connection: Connection
}): Promise<{ signature: string; status: string }> {
	try {
		const signerKeypair = signer
		const { blockhash } = await connection.getLatestBlockhash()

		// Get latest blockhash
		transaction.recentBlockhash = blockhash
		transaction.sign(signerKeypair)

		const signature = await sendAndConfirmTransaction(
			connection,
			transaction,
			[signerKeypair],
			{
				commitment: 'confirmed', // We can use 'finalized' for stronger confirmation
				preflightCommitment: 'confirmed',
			},
		)

		if (!signature) {
			throw new Error('Transaction signature is null or undefined')
		}

		return {
			signature,
			status: 'SUCCESS',
		}
	} catch (error) {
		throw new HttpException(
			{
				status: HttpStatus.BAD_REQUEST,
				message: `Transaction failed: ${error.message}`,
			},
			HttpStatus.BAD_REQUEST,
		)
	}
}
