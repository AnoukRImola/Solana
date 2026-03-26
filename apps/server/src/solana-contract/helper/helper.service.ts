import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
} from '@solana/spl-token'
import {
	Connection,
	PublicKey,
} from '@solana/web3.js'
import { apiConfig } from 'src/config/api.config'
import { getConnection, getProgram } from 'src/config/constants/program.constant'
import { ApiResponse } from 'src/interfaces/response.interface'
import { buildTransaction } from 'src/utils/transaction.utils'
import { PendingWriteHandlerService } from '../queue/pending-write-handler.service'
import { PendingWriteQueueService } from '../queue/pending-write-queue.service'

@Injectable()
export class HelperService {
	public solanaServer: Connection

	constructor(
		private pendingWriteQueue: PendingWriteQueueService,
		private pendingWriteHandler: PendingWriteHandlerService,
	) {
		this.solanaServer = getConnection()
	}

	async sendTransaction(
		serializedSignedTransaction: string,
		queueKey: string,
		returnEscrowDataIsRequired: boolean,
		saveInfo = true,
	): Promise<ApiResponse> {
		let txSignature = ''

		try {
			const transactionBuffer = Buffer.from(
				serializedSignedTransaction,
				'base64',
			)
			txSignature = await this.solanaServer.sendRawTransaction(
				transactionBuffer,
				{ skipPreflight: false },
			)

			const { blockhash, lastValidBlockHeight } =
				await this.solanaServer.getLatestBlockhash()
			const trnxConfirmed = await this.solanaServer.confirmTransaction(
				{
					signature: txSignature,
					blockhash,
					lastValidBlockHeight,
				},
				'confirmed',
			)

			if (trnxConfirmed.value.err)
				throw new Error(
					`Transaction failed: ${trnxConfirmed.value.err.toString()}`,
				)

			if (saveInfo) await this.handlePendingWrite(queueKey, txSignature)

			if (!returnEscrowDataIsRequired) {
				return {
					status: 'SUCCESS',
					message: 'Transaction successfully sent to the Solana network.',
					unsignedTransaction: txSignature,
				}
			}

			// Fetch escrow data using Anchor after confirmation
			const contractId = this.resolveContractId(queueKey)
			if (!contractId) {
				return {
					status: 'SUCCESS',
					message: 'Transaction successful, but contract ID not determined.',
				}
			}

			try {
				const program = getProgram()
				const escrowPda = new PublicKey(contractId)
				const escrowData = await program.account.escrowData.fetch(escrowPda)

				return {
					status: 'SUCCESS',
					message: 'Transaction successful and escrow data retrieved.',
					contract_id: contractId,
					escrow: {
						engagementId: escrowData.engagementId,
						title: escrowData.title,
						description: escrowData.description,
						amount: escrowData.amount.toString(),
						platformFee: escrowData.platformFee.toString(),
						milestones: escrowData.milestones.map((m) => ({
							description: m.description,
							status: m.status,
							evidence: m.evidence,
							approved_flag: m.approvedFlag,
						})),
						disputeFlag: escrowData.flags.dispute,
						releaseFlag: escrowData.flags.release,
						resolvedFlag: escrowData.flags.resolved,
						trustline: escrowData.trustline.address.toBase58(),
						trustlineDecimals: escrowData.trustline.decimals,
						receiverMemo: escrowData.receiverMemo.toString(),
						approver: escrowData.roles.approver.toBase58(),
						serviceProvider: escrowData.roles.serviceProvider.toBase58(),
						platformAddress: escrowData.roles.platformAddress.toBase58(),
						releaseSigner: escrowData.roles.releaseSigner.toBase58(),
						disputeResolver: escrowData.roles.disputeResolver.toBase58(),
						receiver: escrowData.roles.receiver.toBase58(),
						contractId,
					},
				}
			} catch {
				return {
					status: 'SUCCESS',
					message:
						'Transaction successful, but escrow data could not be retrieved.',
					contract_id: contractId,
				}
			}
		} catch (error) {
			console.error('Solana sendTransaction error:', error)
			let errorMessage = 'Failed to send transaction to Solana network.'
			if (error.logs) {
				errorMessage += ` Logs: ${error.logs.join(', ')}`
			} else if (error.message) {
				errorMessage = error.message
			}

			throw new HttpException(
				{
					status: HttpStatus.BAD_REQUEST,
					message: errorMessage,
					tx_signature: txSignature || undefined,
				},
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async establishTrustline(walletAddress: string): Promise<ApiResponse> {
		try {
			const ownerPublicKey = new PublicKey(walletAddress)

			const usdcMint = process.env.USDC_TOKEN_MINT || ''
			const tokenMintAddress = new PublicKey(usdcMint)

			const associatedTokenAddress = await getAssociatedTokenAddress(
				tokenMintAddress,
				ownerPublicKey,
			)

			const tokenAccount = await this.solanaServer.getAccountInfo(
				associatedTokenAddress,
			)

			if (tokenAccount !== null) {
				return {
					status: 'SUCCESS',
					message: 'The USDC token account already exists for this wallet',
				}
			}

			const transaction = await buildTransaction({
				account: ownerPublicKey,
				connection: this.solanaServer,
				operations: [
					createAssociatedTokenAccountInstruction(
						ownerPublicKey,
						associatedTokenAddress,
						ownerPublicKey,
						tokenMintAddress,
					),
				],
			})

			const unsignedTx = transaction
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS',
				message: 'Sign this transaction to create your USDC token account',
				unsignedTransaction: unsignedTx,
			}
		} catch (error) {
			console.error('Error building trustline transaction:', error)

			let errorMessage = 'Failed to build token account transaction'
			if (error.logs) {
				errorMessage += ` Logs: ${error.logs.join(', ')}`
			} else if (error.message) {
				errorMessage = error.message
			}

			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: errorMessage },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async getMultipleEscrowBalance(
		signer: string,
		addresses: string[],
	): Promise<{ address: string; balance: number }[]> {
		try {
			const results: { address: string; balance: number }[] = []

			for (const addr of addresses) {
				try {
					const pubkey = new PublicKey(addr)
					const balanceInfo =
						await this.solanaServer.getTokenAccountBalance(pubkey)
					results.push({
						address: addr,
						balance: Number(balanceInfo.value.uiAmount || 0),
					})
				} catch {
					results.push({ address: addr, balance: 0 })
				}
			}

			return results
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	private resolveContractId(queueKey: string): string | undefined {
		const pendingItem = this.pendingWriteQueue.get(queueKey)
		if (!pendingItem) return queueKey

		if (pendingItem.type === 'SAVE_ESCROW') {
			return (pendingItem.payload.contractId as string) || queueKey
		}
		return (pendingItem.payload.contractId as string) || queueKey
	}

	private async handlePendingWrite(
		queueKey: string,
		responseHash: string,
	): Promise<void> {
		const pending = this.pendingWriteQueue.get(queueKey)

		if (!pending) return

		try {
			await this.pendingWriteHandler.execute(pending.type, pending.payload)
			this.pendingWriteQueue.remove(queueKey)
		} catch (err) {
			console.error(
				`Error handling pending write for key ${queueKey} (type: ${pending.type}). ` +
				`Entry kept in queue for potential retry. TX: ${responseHash}`,
				err,
			)
		}
	}
}
