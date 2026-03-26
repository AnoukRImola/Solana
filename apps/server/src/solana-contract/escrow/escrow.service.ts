import { createHash } from 'node:crypto'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import * as borsh from '@project-serum/borsh'
import {
	Connection,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js'
import { apiConfig } from 'src/config/api.config'
import type {
	ApiResponse,
	EscrowCamelCaseResponse,
} from 'src/interfaces/response.interface'
import { mapErrorCodeToMessage } from 'src/utils/errors.utils'
import { adjustPricesToMicroUSDC } from 'src/utils/parse.utils'
import { buildTransaction } from 'src/utils/transaction.utils'
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
	private trustlessContractId: string
	private solanaServer: Connection

	constructor(
		private pendingWriteQueue: PendingWriteQueueService,
		private readonly escrowFirestoreService: EscrowFirestoreService,
		private readonly helperService: HelperService,
	) {
		this.trustlessContractId = apiConfig.trustlessContractId
		this.solanaServer = this.helperService.solanaServer
	}

	private async getSolanaAddress(
		signer: string,
	): Promise<Buffer<ArrayBufferLike> | null> {
		const publicKey = new PublicKey(signer)
		try {
			const accountInfo = await this.solanaServer.getAccountInfo(publicKey)

			if (!accountInfo?.data) throw new Error('Account not found')

			return accountInfo?.data
		} catch (e) {
			console.error(`Failed to deserialize account data for ${signer}:`, e)
			return null
		}
	}

	async fundEscrow(
		contractId: string,
		signer: string,
		amount: string,
	): Promise<ApiResponse> {
		try {
			const contract = new PublicKey(contractId)
			const account = new PublicKey(signer)

			const operationData = Buffer.from(
				borsh
					.struct([
						borsh.str('action'),
						borsh.str('contract_id'),
						borsh.u128('price'),
					])
					.encode({
						action: 'fund_escrow',
						price: amount,
						signer,
					}),
			)
			const transaction = await buildTransaction({
				account,
				connection: this.solanaServer,
				operations: [
					new TransactionInstruction({
						keys: [
							{ pubkey: account, isSigner: true, isWritable: true },
							{ pubkey: contract, isSigner: false, isWritable: true },
							{
								pubkey: SystemProgram.programId,
								isSigner: false,
								isWritable: false,
							},
						],
						programId: new PublicKey(this.trustlessContractId),
						data: operationData,
					}),
				],
			})

			const serializedTransaction = transaction.serialize({
				requireAllSignatures: false,
				verifySignatures: false,
			})

			const preparedTransaction = {
				hash: () => createHash('sha256').update(serializedTransaction).digest(),
				toXDR: () => serializedTransaction.toString('base64'),
			}
			const txHash = preparedTransaction.hash().toString('hex')

			this.pendingWriteQueue.add(txHash, {
				type: 'SET_BALANCE',
				payload: {
					contractId,
					amount,
				},
			})

			return {
				status: 'SUCCESS',
				unsignedTransaction: preparedTransaction.toXDR(),
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	// TODO: PR5 — Rewrite with Anchor program.methods.releaseFunds()
	async releaseFunds(
		contractId: string,
		releaseSigner: string,
	): Promise<ApiResponse> {
		throw new HttpException(
			{ status: HttpStatus.NOT_IMPLEMENTED, message: 'Not yet implemented for Solana. See PR5.' },
			HttpStatus.NOT_IMPLEMENTED,
		)
	}

	// TODO: PR5 — Rewrite with Anchor program.methods.resolveDispute()
	async resolveDispute(
		contractId: string,
		disputeResolver: string,
		approverFunds: string,
		receiverFunds: string,
	): Promise<ApiResponse> {
		throw new HttpException(
			{ status: HttpStatus.NOT_IMPLEMENTED, message: 'Not yet implemented for Solana. See PR5.' },
			HttpStatus.NOT_IMPLEMENTED,
		)
	}

	// TODO: PR5 — Rewrite with Anchor program.methods.changeMilestoneStatus()
	async changeMilestoneStatus(
		contractId: string,
		milestoneIndex: string,
		newStatus: string,
		newEvidence: string,
		serviceProvider: string,
	): Promise<ApiResponse> {
		throw new HttpException(
			{ status: HttpStatus.NOT_IMPLEMENTED, message: 'Not yet implemented for Solana. See PR5.' },
			HttpStatus.NOT_IMPLEMENTED,
		)
	}

	// TODO: PR5 — Rewrite with Anchor program.methods.changeMilestoneFlag()
	async changeMilestoneFlag(
		contractId: string,
		milestoneIndex: string,
		newFlag: boolean,
		approver: string,
	): Promise<ApiResponse> {
		throw new HttpException(
			{ status: HttpStatus.NOT_IMPLEMENTED, message: 'Not yet implemented for Solana. See PR5.' },
			HttpStatus.NOT_IMPLEMENTED,
		)
	}

	// TODO: PR5 — Rewrite with Anchor program.methods.changeDisputeFlag()
	async changeDisputeFlag(
		contractId: string,
		signer: string,
	): Promise<ApiResponse> {
		throw new HttpException(
			{ status: HttpStatus.NOT_IMPLEMENTED, message: 'Not yet implemented for Solana. See PR5.' },
			HttpStatus.NOT_IMPLEMENTED,
		)
	}

	// TODO: PR5 — Rewrite with Anchor program.account.escrowData.fetch()
	async getEscrowByContractID(
		signer: string,
		contractId: string,
	): Promise<EscrowCamelCaseResponse> {
		throw new HttpException(
			{ status: HttpStatus.NOT_IMPLEMENTED, message: 'Not yet implemented for Solana. See PR5.' },
			HttpStatus.NOT_IMPLEMENTED,
		)
	}

	async updateEscrowByContractID(
		contractId: string,
		signer: string,
		escrow: EscrowDto,
	): Promise<ApiResponse> {
		try {
			// TODO: PR5 — Rewrite with Anchor program.methods.changeEscrowProperties()
			await this.escrowFirestoreService.updateEscrowData(
				contractId,
				signer,
				escrow,
			)

			return {
				status: 'SUCCESS',
				message: 'Escrow data updated in Firestore. On-chain update pending PR5.',
			}
		} catch (error) {
			console.error('Error in updateEscrowByContractID:', error)
			const message = error instanceof Error ? error.message : 'Failed to update escrow.'
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}
}
