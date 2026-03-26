// src/solana-contract/queue/pending-write-handler.service.ts
import { Injectable } from '@nestjs/common'
import { FirebaseService } from 'src/firebase/firebase.service'
import { Escrow } from 'src/interfaces/escrow.interface'
import { createNotification } from 'src/utils/firebase.utils'
import { EscrowFirestoreService } from '../escrow/firestore-services/escrow-firestore.service'

@Injectable()
export class PendingWriteHandlerService {
	constructor(
		private readonly escrowFirestoreService: EscrowFirestoreService,
		private readonly firebaseService: FirebaseService,
	) {}

	async execute(type: string, payload: any): Promise<void> {
		switch (type) {
			case 'SAVE_ESCROW':
				await this.escrowFirestoreService.saveEscrow(payload)
				break

			case 'UPDATE_MILESTONE_FLAG':
				await this.escrowFirestoreService.updateMilestoneFlag(
					payload.contractId,
					payload.milestone_index,
					payload.new_flag,
				)
				break

			case 'UPDATE_MILESTONE_STATUS':
				await this.escrowFirestoreService.updateMilestoneStatus(
					payload.contractId,
					payload.milestone_index,
					payload.new_status,
					payload.new_evidence,
				)
				break

			case 'SET_BALANCE':
				const { data: escrow } =
					await this.escrowFirestoreService.getDocByContractId(
						payload.contractId,
					)

				await createNotification(this.firebaseService, {
					contractId: payload.contractId,
					type: 'escrow_balance_updated',
					title: 'Escrow Balance Updated',
					message: `The escrow "${escrow.title}" has been funded with ${payload.amount} ${escrow.trustline.name}.`,
					entities: [
						escrow.approver,
						escrow.serviceProvider,
						escrow.platformAddress,
						escrow.releaseSigner,
						escrow.disputeResolver,
						escrow.receiver,
					],
				})
				break

			case 'START_DISPUTE':
				await this.escrowFirestoreService.startDispute(payload.contractId)
				break

			case 'RESOLVE_DISPUTE':
				await this.escrowFirestoreService.resolveDispute(
					payload.contractId,
					payload.disputeResolver,
					payload.approverFunds,
					payload.receiverFunds,
				)
				break

			case 'MARK_RELEASED':
				await this.escrowFirestoreService.markEscrowAsReleased(
					payload.contractId,
				)
				break

			case 'EDIT_ESCROW':
				await this.escrowFirestoreService.updateEscrowData(
					payload.contractId,
					payload.signer,
					payload.escrow,
				)
				break

			default:
				throw new Error(`Unhandled pending write type: ${type}`)
		}
	}
}
