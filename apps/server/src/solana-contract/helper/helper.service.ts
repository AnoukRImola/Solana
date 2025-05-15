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
import * as StellarSDK from '@stellar/stellar-sdk'
import { apiConfig } from 'src/config/api.config'
import { ApiResponse } from 'src/interfaces/response.interface'
import { mapErrorCodeToMessage } from 'src/utils/errors.utils'
import { deserializeEscrow, microUSDTToDecimal } from 'src/utils/parse.utils'
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
		this.usdcTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN || ''
		this.usdtTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN || ''
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
		serializedSignedTransaction: string, // Base64 encoded string of the signed transaction
		queueKey: string, // The key used to store/retrieve from pendingWriteQueue for this operation
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
					skipPreflight: false, // Set to true if preflight is done client-side or causing issues
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
			// Pass the original queueKey and the new txSignature
			if (saveInfo) await this.handlePendingWrite(queueKey, txSignature)
			if (!returnEscrowDataIsRequired) {
				return {
					status: 'SUCCESS',
					message: 'Transaction successfully sent to the Solana network.',
					unsignedTransaction: txSignature,
				}
			}

			let contractIdForFetching: string | undefined
			// Attempt to get the contractId, which might be the queueKey itself (e.g., for new escrows)
			// or part of the payload for existing escrows.
			const pendingItem = this.pendingWriteQueue.get(queueKey)

			if (pendingItem) {
				// Get the potentially updated item
				if (pendingItem.type === 'SAVE_ESCROW') {
					// For SAVE_ESCROW, the contractId is typically the queueKey (escrow account pubkey)
					// or it was added to the payload by handlePendingWrite.
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
					status: 'SUCCESS_NO_CONTRACT_ID',
					message:
						'Transaction successful, but contract ID for fetching escrow data was not determined.',
				}
			}

			const escrowAccountPubkey = new PublicKey(contractIdForFetching)
			const escrowAccountInfo =
				await this.solanaServer.getAccountInfo(escrowAccountPubkey)

			if (!escrowAccountInfo?.data) {
				return {
					status: 'SUCCESS_NO_DATA',
					message:
						'Transaction successful, but escrow data could not be retrieved from account.',
					contract_id: contractIdForFetching,
				}
			}

			// ? Should we use the transactionBuffer or the account data ? Ask Team. -Andler.
			// const escrow = deserializeEscrow(transactionBuffer)
			const escrow = deserializeEscrow(escrowAccountInfo.data)

			return {
				status: 'SUCCESS',
				message: 'Transaction successful and escrow data retrieved.',
				contract_id: contractIdForFetching,
				escrow,
			}
		} catch (error) {
			console.error('Solana sendTransaction error:', error)
			// Basic error mapping, can be expanded
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
			// Parse the user's keypair from the provided secret key
			const secretKeyBuffer = Buffer.from(sourceSecretKey, 'base64')
			this.sourceKeypair = Keypair.fromSecretKey(secretKeyBuffer)
			const ownerPublicKey = this.sourceKeypair.publicKey

			// Parse the USDC token mint address
			// TODO: Is Trustline in USDC only? -Andler.
			const tokenMintAddress = new PublicKey(this.usdcTokenPublic)

			// Get the associated token account address
			const associatedTokenAddress = await getAssociatedTokenAddress(
				tokenMintAddress, // mint
				ownerPublicKey, // owner
			)

			// Check if the associated token account already exists
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
				account: ownerPublicKey, // payer
				connection: this.solanaServer,
				operations: [
					createAssociatedTokenAccountInstruction(
						ownerPublicKey, // payer
						associatedTokenAddress, // associated token account
						ownerPublicKey, // owner
						tokenMintAddress, // mint
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

	async getMultipleEscrowBalance(
		signer: string,
		addresses: string[],
	): Promise<{ address: string; balance: number }[]> {
		try {
			const programId = new PublicKey(this.trustlessContractId)
			const accountPublicKey = new PublicKey(signer)
			const account = await this.solanaServer.getAccountInfo(accountPublicKey)

			const addressScVals = addresses.map((addr) =>
				new StellarSDK.Address(addr).toScVal(),
			)
			const vectorScVal = StellarSDK.xdr.ScVal.scvVec(addressScVals)

			const operations = [
				contract.call('get_multiple_escrow_balances', vectorScVal),
			]
			const transaction = buildTransaction({ account, operations })
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)
			const result: any =
				await this.sorobanServer.simulateTransaction(preparedTransaction)

			const retval = result.result?.retval
			if (!retval) {
				throw new Error('No se pudo obtener el valor de retorno del contrato.')
			}

			const balances = parseBalance(retval)

			return balances.map((item) => ({
				address: item.address,
				balance: microUSDTToDecimal({
					microToken: item.balance,
					decimals: Number(item.trustlineDecimals),
				}),
			}))
		} catch (error) {
			if (error.message.includes('HostError: Error(Contract, #')) {
				const errorCode = error.message.match(/Error\(Contract, #(\d+)\)/)?.[1]
				const errorMessage = mapErrorCodeToMessage(errorCode)
				throw new HttpException(
					{ status: HttpStatus.BAD_REQUEST, message: errorMessage },
					HttpStatus.BAD_REQUEST,
				)
			}

			throw error
		}
	}

	private async handlePendingWrite(
		txHash: string,
		responseHash: string,
	): Promise<void> {
		const pending = this.pendingWriteQueue.get(txHash)

		if (!pending) return

		try {
			if (pending.type === 'SAVE_ESCROW') {
				const data: any = await this.sorobanServer.getTransaction(responseHash)
				const transactionMeta = data.resultMetaXdr.v3().sorobanMeta()
				const returnValue = transactionMeta.returnValue()
				const result = parseScVal(returnValue)

				const updatedPayload = {
					escrowProperties: {
						...pending.payload.escrowProperties,
						contractId: result[0],
					},
				}

				const updatedQueue = this.pendingWriteQueue.updatePayload(
					txHash,
					updatedPayload,
				)

				await this.pendingWriteHandler.execute(
					pending.type,
					updatedQueue.payload.escrowProperties,
				)
			} else {
				await this.pendingWriteHandler.execute(pending.type, pending.payload)
			}
		} catch (err) {
			console.error(`❌ Error handling pending write:`, err)
		} finally {
			this.pendingWriteQueue.remove(txHash)
		}
	}
}
