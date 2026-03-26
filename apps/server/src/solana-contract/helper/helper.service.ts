import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
} from '@solana/spl-token'
import {
	Commitment,
	Connection,
	ConnectionConfig,
	Keypair,
	PublicKey,
} from '@solana/web3.js'
import { apiConfig } from 'src/config/api.config'
import { ApiResponse } from 'src/interfaces/response.interface'
import { deserializeEscrow } from 'src/utils/parse.utils'
import {
	buildTransaction,
	signAndSendTransaction,
} from 'src/utils/transaction.utils'
import { PendingWriteHandlerService } from '../queue/pending-write-handler.service'
import { PendingWriteQueueService } from '../queue/pending-write-queue.service'

@Injectable()
export class HelperService {
	private sourceKeypair: Keypair

	public trustlessContractId: string
	public usdtTokenPublic: string
	public usdcTokenPublic: string
	public solanaServer: Connection

	constructor(
		private pendingWriteQueue: PendingWriteQueueService,
		private pendingWriteHandler: PendingWriteHandlerService,
	) {
		this.trustlessContractId = apiConfig.trustlessContractId
		this.usdcTokenPublic = process.env.USDC_TOKEN_MINT || ''
		this.usdtTokenPublic = process.env.USDT_TOKEN_MINT || ''
		this.solanaServer = this.getServerConnection()
	}

	getServerConnection(options?: Commitment | ConnectionConfig): Connection {
		try {
			const connection = new Connection(
				apiConfig.solanaServerURL,
				options || 'confirmed',
			)

			return connection
		} catch (error) {
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: `<SOL Connection>${error.message}`,
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
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
				{
					skipPreflight: false,
				},
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

			let contractIdForFetching: string | undefined
			const pendingItem = this.pendingWriteQueue.get(queueKey)

			if (pendingItem) {
				if (pendingItem.type === 'SAVE_ESCROW') {
					contractIdForFetching =
						(
							pendingItem.payload.escrowProperties as Partial<
								Record<string, string>
							>
						)?.contractId || queueKey
				} else if (pendingItem.payload?.contractId) {
					contractIdForFetching = pendingItem.payload.contractId as string
				}
			}

			if (!contractIdForFetching) {
				return {
					status: 'SUCCESS',
					message:
						'Transaction successful, but contract ID for fetching escrow data was not determined.',
				}
			}

			const escrowAccountPubkey = new PublicKey(contractIdForFetching)
			const escrowAccountInfo =
				await this.solanaServer.getAccountInfo(escrowAccountPubkey)

			if (!escrowAccountInfo?.data) {
				return {
					status: 'SUCCESS',
					message:
						'Transaction successful, but escrow data could not be retrieved from account.',
					contract_id: contractIdForFetching,
				}
			}

			const escrow = deserializeEscrow(escrowAccountInfo.data)

			return {
				status: 'SUCCESS',
				message: 'Transaction successful and escrow data retrieved.',
				contract_id: contractIdForFetching,
				escrow,
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

	async establishTrustline(sourceSecretKey: string): Promise<ApiResponse> {
		try {
			const secretKeyBuffer = Buffer.from(sourceSecretKey, 'base64')
			this.sourceKeypair = Keypair.fromSecretKey(secretKeyBuffer)
			const ownerPublicKey = this.sourceKeypair.publicKey

			const tokenMintAddress = new PublicKey(this.usdcTokenPublic)

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
			const signatureResults = await signAndSendTransaction({
				transaction,
				signer: this.sourceKeypair,
				connection: this.solanaServer,
			})

			return {
				status: 'SUCCESS',
				message: 'The USDC token account has been successfully created',
				unsignedTransaction: signatureResults.signature,
			}
		} catch (error) {
			console.error('Error establishing Solana token account:', error)

			let errorMessage = 'Failed to establish token account in Solana'
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

	// TODO: PR5 — Rewrite using getConnection().getTokenAccountBalance()
	async getMultipleEscrowBalance(
		signer: string,
		addresses: string[],
	): Promise<{ address: string; balance: number }[]> {
		try {
			const results: { address: string; balance: number }[] = []

			for (const addr of addresses) {
				try {
					const pubkey = new PublicKey(addr)
					const balanceInfo = await this.solanaServer.getTokenAccountBalance(pubkey)
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

	private async handlePendingWrite(
		txHash: string,
		responseHash: string,
	): Promise<void> {
		const pending = this.pendingWriteQueue.get(txHash)

		if (!pending) return

		try {
			await this.pendingWriteHandler.execute(pending.type, pending.payload)
		} catch (err) {
			console.error(`Error handling pending write:`, err)
		} finally {
			this.pendingWriteQueue.remove(txHash)
		}
	}
}
