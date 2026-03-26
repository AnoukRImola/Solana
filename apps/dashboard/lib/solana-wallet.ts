import { Transaction } from '@solana/web3.js'

export type WalletSignTransaction = (
	transaction: Transaction,
) => Promise<Transaction>

export async function signAndSerialize(
	unsignedTxBase64: string,
	signTransaction: WalletSignTransaction,
): Promise<string> {
	const txBuffer = Buffer.from(unsignedTxBase64, 'base64')
	const transaction = Transaction.from(txBuffer)
	const signedTransaction = await signTransaction(transaction)
	return Buffer.from(
		signedTransaction.serialize({ requireAllSignatures: true }),
	).toString('base64')
}
