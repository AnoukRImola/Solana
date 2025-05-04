import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as StellarSDK from '@stellar/stellar-sdk'
import type {
	ApiResponse,
	escrowCamelCaseResponse,
} from 'src/interfaces/response.interface'
import {
	adjustPricesToMicroUSDC,
	parseEscrow,
	parseEscrowByContractId,
} from 'src/utils/parse.utils'
import { buildTransaction } from 'src/utils/transaction.utils'
import type { AllbridgeService } from '../../../src copy/solana/allbridge.service'
import { mapErrorCodeToMessage } from '../../utils/errors.utils'
import type { HelperService } from '../helper/helper.service'
import type { PendingWriteQueueService } from '../queue/pending-write-queue.service'
import type { EscrowDto } from './Dto/escrow.dto'
import type { EscrowFirestoreService } from './firestore-services/escrow-firestore.service'

interface FundEscrowSwapData {
	originalCurrency: string
	usdcAmount: string
	conversionRate: string
	conversionTimestamp: number
}

@Injectable()
export class EscrowService {
	private horizonServer: StellarSDK.Horizon.Server
	private sorobanServer: StellarSDK.SorobanRpc.Server
	private trustless_contract_id: string
	private trustless_address: string
	private usdc_public_address: string

	constructor(
		private pendingWriteQueue: PendingWriteQueueService,
		private readonly escrowFirestoreService: EscrowFirestoreService,
		private readonly allbridgeService: AllbridgeService,
		private readonly helperService: HelperService,
	) {
		this.horizonServer = new StellarSDK.Horizon.Server(
			`${process.env.SERVER_URL}`,
			{ allowHttp: true },
		)
		this.sorobanServer = new StellarSDK.SorobanRpc.Server(
			`${process.env.SOROBAN_SERVER_URL}`,
			{ allowHttp: true },
		)
		this.trustless_contract_id = process.env.TRUSTLESS_CONTRACT_ID
		this.trustless_address = process.env.TRUSTLESS_ADDRESS
	}

	async fundEscrow(
		contractId: string,
		signer: string,
		amount: string,
		swapData?: FundEscrowSwapData,
	): Promise<ApiResponse> {
		try {
			const escrowAmount = swapData?.usdcAmount || amount
			let unsignedConversionTransaction = ''

			// If not USDC, perform swap via Allbridge
			if (swapData?.originalCurrency !== 'USDC') {
				const swapResult = await this.allbridgeService.swapToUSDC({
					fromToken: swapData.originalCurrency,
					amount,
					userAddress: signer,
					walletType: 'stellar',
				})
				unsignedConversionTransaction = swapResult.txHash
			}

			const contract = new StellarSDK.Contract(contractId)
			const account = await this.sorobanServer.getAccount(signer)

			const { trustline_decimals } = await this.getEscrowByContractID(
				signer,
				contractId,
			)

			const adjustedPrice = adjustPricesToMicroUSDC(
				escrowAmount,
				trustline_decimals,
			)
			const scValPrice = StellarSDK.nativeToScVal(adjustedPrice, {
				type: 'i128',
			})

			const operations = [
				contract.call(
					'fund_escrow',
					StellarSDK.Address.fromString(signer).toScVal(),
					scValPrice,
				),
			]

			const transaction = buildTransaction(account, operations, '1000')
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'SET_BALANCE',
				payload: {
					contractId,
					amount: escrowAmount,
					swapData: {
						...swapData,
						originalAmount: amount,
						unsignedConversionTransaction,
					},
				},
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
				unsignedConversionTransaction,
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

	async sendFundsWithMemo(
		contractId: string,
		signer: string,
	): Promise<ApiResponse> {
		const asset = new StellarSDK.Asset('USDC', this.usdc_public_address)
		const { receiver_memo, receiver } = await this.getEscrowByContractID(
			signer,
			contractId,
		)
		const currentBalance = await this.helperService.getMultipleEscrowBalance(
			signer,
			[contractId],
		)

		const paymentOperation = StellarSDK.Operation.payment({
			amount: currentBalance[0].balance.toString(),
			destination: receiver,
			asset,
			source: contractId,
		})

		const accountInfo = await this.sorobanServer.getAccount(signer)

		const transaction = new StellarSDK.TransactionBuilder(accountInfo, {
			fee: StellarSDK.BASE_FEE,
			networkPassphrase: StellarSDK.Networks.TESTNET,
		})
			.addOperation(paymentOperation)
			.addMemo(StellarSDK.Memo.text(receiver_memo.toString()))
			.setTimeout(30)
			.build()

		return {
			status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
			unsignedTransaction: transaction.toXDR(),
		}
	}

	async distributeEscrowEarnings(
		contractId: string,
		releaseSigner: string,
	): Promise<ApiResponse> {
		try {
			const contract = new StellarSDK.Contract(contractId)
			const account = await this.sorobanServer.getAccount(releaseSigner)

			const operations = [
				contract.call(
					'distribute_escrow_earnings',
					StellarSDK.Address.fromString(releaseSigner).toScVal(),
					StellarSDK.Address.fromString(this.trustless_address).toScVal(),
				),
			]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'MARK_RELEASED',
				payload: { contractId },
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
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

	async resolvingDisputes(
		contractId: string,
		disputeResolver: string,
		approverFunds: string,
		receiverFunds: string,
	): Promise<ApiResponse> {
		try {
			const contract = new StellarSDK.Contract(contractId)
			const account = await this.horizonServer.loadAccount(disputeResolver)

			const { trustline_decimals } = await this.getEscrowByContractID(
				disputeResolver,
				contractId,
			)

			const adjustedApproverFunds = adjustPricesToMicroUSDC(
				approverFunds,
				trustline_decimals,
			)
			const scValapproverFunds = StellarSDK.nativeToScVal(
				adjustedApproverFunds,
				{ type: 'i128' },
			)
			const adjustedServiceProviderFunds = adjustPricesToMicroUSDC(
				receiverFunds,
				trustline_decimals,
			)
			const scValServiceProviderFunds = StellarSDK.nativeToScVal(
				adjustedServiceProviderFunds,
				{ type: 'i128' },
			)

			const operations = [
				contract.call(
					'resolving_disputes',
					StellarSDK.Address.fromString(disputeResolver).toScVal(),
					scValapproverFunds,
					scValServiceProviderFunds,
					StellarSDK.Address.fromString(this.trustless_address).toScVal(),
				),
			]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'RESOLVE_DISPUTE',
				payload: { contractId, disputeResolver, approverFunds, receiverFunds },
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
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

	async changeMilestonesStatus(
		contractId: string,
		milestone_index: string,
		new_status: string,
		new_evidence: string,
		service_provider: string,
	): Promise<ApiResponse> {
		try {
			const contract = new StellarSDK.Contract(contractId)
			const account = await this.horizonServer.loadAccount(service_provider)

			const operations = [
				contract.call(
					'change_milestone_status',
					StellarSDK.nativeToScVal(milestone_index, { type: 'i128' }),
					StellarSDK.xdr.ScVal.scvString(new_status),
					new_evidence
						? StellarSDK.xdr.ScVal.scvString(new_evidence)
						: StellarSDK.xdr.ScVal.scvString(''),
					StellarSDK.Address.fromString(service_provider).toScVal(),
				),
			]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'UPDATE_MILESTONE_STATUS',
				payload: { contractId, milestone_index, new_status, new_evidence },
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
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

	async changeMilestonesFlag(
		contractId: string,
		milestone_index: string,
		new_flag: boolean,
		approver: string,
	): Promise<ApiResponse> {
		try {
			const contract = new StellarSDK.Contract(contractId)
			const account = await this.horizonServer.loadAccount(approver)

			const scValMilestoneIndex = StellarSDK.nativeToScVal(milestone_index, {
				type: 'i128',
			})

			const operations = [
				contract.call(
					'change_milestone_flag',
					scValMilestoneIndex,
					StellarSDK.nativeToScVal(new_flag, { type: 'bool' }),
					StellarSDK.Address.fromString(approver).toScVal(),
				),
			]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'UPDATE_MILESTONE_FLAG',
				payload: { contractId, milestone_index, new_flag },
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
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

	async changeDisputeFlag(
		contractId: string,
		signer: string,
	): Promise<ApiResponse> {
		try {
			const contract = new StellarSDK.Contract(contractId)
			const account = await this.sorobanServer.getAccount(signer)

			const operations = [contract.call('change_dispute_flag')]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'START_DISPUTE',
				payload: { contractId },
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
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

	async updateEscrowByContractID(
		contractId: string,
		signer: string,
		escrow: EscrowDto,
	): Promise<ApiResponse> {
		try {
			const contract = new StellarSDK.Contract(contractId)
			const account = await this.sorobanServer.getAccount(signer)
			const escrowScVal = parseEscrow(escrow)

			const operations = [
				contract.call(
					'change_escrow_properties',
					StellarSDK.Address.fromString(signer).toScVal(),
					escrowScVal,
				),
			]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)

			await this.escrowFirestoreService.updateEscrowData(
				contractId,
				signer,
				escrow,
			)

			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'EDIT_ESCROW',
				payload: { contractId, signer, escrow },
			})

			return {
				status: StellarSDK.rpc.Api.GetTransactionStatus.SUCCESS,
				unsignedTransaction: preparedTransaction.toXDR(),
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

	async getEscrowByContractID(
		signer,
		contractId: string,
	): Promise<escrowCamelCaseResponse> {
		try {
			const contract = new StellarSDK.Contract(this.trustless_contract_id)
			const account = await this.horizonServer.loadAccount(signer)

			const operations = [
				contract.call(
					'get_escrow_by_contract_id',
					StellarSDK.Address.fromString(contractId).toScVal(),
				),
			]

			const transaction = buildTransaction(account, operations)
			const preparedTransaction =
				await this.sorobanServer.prepareTransaction(transaction)
			const result = (await this.sorobanServer.simulateTransaction(
				preparedTransaction,
			)) as unknown as {
				result: Record<string, unknown>
			}

			const retval = result.result?.retval
			if (!retval) {
				throw new Error('No se pudo obtener el valor de retorno del contrato.')
			}

			const parseEscrow = parseEscrowByContractId(retval)

			return parseEscrow
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
}
