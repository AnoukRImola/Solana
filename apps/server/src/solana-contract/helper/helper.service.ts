import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as StellarSDK from '@stellar/stellar-sdk'
import {
	ApiResponse,
	escrowCamelCaseResponse,
} from 'src/interfaces/response.interface'
import { mapErrorCodeToMessage } from 'src/utils/errors.utils'
import {
	microUSDToDecimal,
	parseBalance,
	parseScVal,
} from 'src/utils/parse.utils'
import {
	buildTransaction,
	signAndSendTransaction,
} from 'src/utils/transaction.utils'
import { PendingWriteHandlerService } from '../queue/pending-write-handler.service'
import { PendingWriteQueueService } from '../queue/pending-write-queue.service'

@Injectable()
export class HelperService {
	private horizonServer: StellarSDK.Horizon.Server
	private sorobanServer: StellarSDK.SorobanRpc.Server
	private sourceKeypair: StellarSDK.Keypair
	private trustless_contract_id: string
	private usdcTokenPublic: string

	constructor(
		private pendingWriteQueue: PendingWriteQueueService,
		private pendingWriteHandler: PendingWriteHandlerService,
	) {
		this.horizonServer = new StellarSDK.Horizon.Server(
			`${process.env.SERVER_URL}`,
			{ allowHttp: true },
		)
		this.sorobanServer = new StellarSDK.SorobanRpc.Server(
			`${process.env.SOROBAN_SERVER_URL}`,
			{ allowHttp: true },
		)
		this.trustless_contract_id = process.env.TRUSTLESS_CONTRACT_ID || ''
		this.usdcTokenPublic = process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN || ''
	}

	async sendTransaction(
		signedXdr: string,
		returnEscrowDataIsRequired: boolean,
		saveInfo = true,
	): Promise<ApiResponse> {
		try {
			const transaction = StellarSDK.TransactionBuilder.fromXDR(
				signedXdr,
				StellarSDK.Networks.TESTNET,
			)

			const txHash = transaction.hash().toString('hex')

			const response = await this.horizonServer.submitTransaction(transaction)

			if (!response.successful) {
				return {
					status: StellarSDK.rpc.Api.GetTransactionStatus.FAILED,
					message:
						'The transaction could not be sent to the Stellar network for some unknown reason. Please try again.',
				}
			}

			if (saveInfo) {
				await this.handlePendingWrite(txHash, response.hash)
			}

			if (returnEscrowDataIsRequired) {
				const data: any = await this.sorobanServer.getTransaction(response.hash)
				const transactionMeta = data.resultMetaXdr.v3().sorobanMeta()
				const returnValue = transactionMeta.returnValue()
				const result = parseScVal(returnValue)
				const escrow: escrowCamelCaseResponse = {
					amount: microUSDToDecimal(
						Number(result[1].amount),
						Number(result[1].trustline_decimals),
					),
					approver: result[1].approver,
					description: result[1].description,
					disputeFlag: result[1].dispute_flag,
					releaseFlag: result[1].release_flag,
					resolvedFlag: result[1].resolved_flag,
					disputeResolver: result[1].dispute_resolver,
					engagementId: result[1].engagement_id,
					milestones: result[1].milestones,
					platformAddress: result[1].platform_address,
					platformFee: Number(result[1].platform_fee),
					releaseSigner: result[1].release_signer,
					serviceProvider: result[1].service_provider,
					title: result[1].title,
					trustline: result[1].trustline,
					trustline_decimals: Number(result[1].trustline_decimals),
					receiver: result[1].receiver,
					receiver_memo: Number(result[1].receiver_memo),
				}
				return {
					status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
					message:
						'The transaction has been successfully sent to the Stellar network.',
					contract_id: result[0],
					escrow,
				}
			}

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				message:
					'The transaction has been successfully sent to the Stellar network.',
			}
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

	async establishTrustline(sourceSecretKey: string): Promise<ApiResponse> {
		try {
			this.sourceKeypair = StellarSDK.Keypair.fromSecret(sourceSecretKey)
			const account = await this.sorobanServer.getAccount(
				this.sourceKeypair.publicKey(),
			)

			const usdcAsset = new StellarSDK.Asset('USDC', this.usdcTokenPublic)

			const operations = [
				StellarSDK.Operation.changeTrust({ asset: usdcAsset }),
			]
			const transaction = buildTransaction(account, operations)

			const result = await signAndSendTransaction(
				transaction,
				this.sourceKeypair,
				this.sorobanServer,
				false,
			)

			if (result.status !== 'SUCCESS') {
				return {
					status: result.status,
					message:
						'An unexpected error occurred while trying to define the trustline in the USDC token. Please try again',
				}
			}

			return {
				status: result.status,
				message: 'The trust line has been correctly defined in the USDC token',
			}
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

	async getMultipleEscrowBalance(
		signer: string,
		addresses: string[],
	): Promise<{ address: string; balance: number }[]> {
		try {
			const contract = new StellarSDK.Contract(this.trustless_contract_id)
			const account = await this.horizonServer.loadAccount(signer)

			const addressScVals = addresses.map((addr) =>
				new StellarSDK.Address(addr).toScVal(),
			)
			const vectorScVal = StellarSDK.xdr.ScVal.scvVec(addressScVals)

			const operations = [
				contract.call('get_multiple_escrow_balances', vectorScVal),
			]
			const transaction = buildTransaction(account, operations)
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
				balance: microUSDToDecimal(
					item.balance,
					Number(item.trustline_decimals),
				),
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
