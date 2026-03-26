import { Injectable } from '@nestjs/common'
import type { FirebaseService } from 'src/firebase/firebase.service'
import type { Milestone } from 'src/interfaces/milestone.interface'
import {
	addEscrow,
	createNotification,
	getTrustlineById,
	updateEscrow,
	updateEscrowByDocId,
} from 'src/utils/firebase.utils'
import type { EscrowDto } from '../Dto/escrow.dto'

@Injectable()
export class EscrowFirestoreService {
	constructor(private readonly firebaseService: FirebaseService) {}

	async saveEscrow(
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		escrowProperties: any,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		try {
			if (!escrowProperties.contractId) {
				throw new Error('❌ Missing contractId in escrowProperties')
			}

			if (escrowProperties.trustline) {
				const trustlineResponse = await getTrustlineById(
					this.firebaseService,
					escrowProperties.trustline,
				)

				if (trustlineResponse.success && trustlineResponse.data) {
					escrowProperties.trustline = {
						name: trustlineResponse.data.name,
						trustline: escrowProperties.trustline,
						trustlineDecimals: escrowProperties.trustlineDecimals,
					}
				} else {
					throw new Error(`Trustline not found: ${trustlineResponse.message}`)
				}

				// * For performance, it is better to left undefined the trustlineDecimals
				// ? Only on extreme cases, we would use the delete reserved word
				// delete escrowProperties.trustlineDecimals;
				escrowProperties.trustlineDecimals = undefined
			}

			const result = await addEscrow(
				this.firebaseService,
				{ ...escrowProperties },
				escrowProperties.contractId,
			)

			if (result.success) {
				await createNotification(this.firebaseService, {
					contractId: escrowProperties.contractId,
					type: 'new_escrow',
					title: 'New Escrow Created',
					message: `You've been added to a new escrow: "${escrowProperties.title}".`,
					entities: [
						escrowProperties.approver,
						escrowProperties.serviceProvider,
						escrowProperties.platformAddress,
						escrowProperties.releaseSigner,
						escrowProperties.disputeResolver,
						escrowProperties.receiver,
					],
				})
			}

			return result
		} catch (error) {
			// Si ocurre un error, devolverlo de manera clara
			return {
				success: false,
				message: (error as Error).message || 'Failed to save escrow data.',
			}
		}
	}

	async updateEscrowBalance(
		contractId: string,
		amount: string,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		try {
			const { id: docId, data: escrow } =
				await this.getDocByContractId(contractId)

			const updatedPayload = {
				balance: amount,
				updatedAt: new Date(),
			}

			const result = await updateEscrowByDocId(this.firebaseService, {
				docId,
				payload: updatedPayload,
			})

			if (result.success) {
				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'escrow_balance_updated',
					title: 'Escrow Balance Updated',
					message: `The escrow "${escrow.title}" has been funded.`,
					entities: [
						escrow.approver,
						escrow.serviceProvider,
						escrow.platformAddress,
						escrow.releaseSigner,
						escrow.disputeResolver,
						escrow.receiver,
					],
				})
			}

			return result
		} catch (error) {
			return {
				success: false,
				message: (error as Error).message || 'Failed to update escrow balance.',
			}
		}
	}

	async markEscrowAsReleased(
		contractId: string,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		try {
			const { id: docId, data: escrow } =
				await this.getDocByContractId(contractId)

			const updatedPayload = {
				releaseFlag: true,
				updatedAt: new Date(),
			}

			const result = await updateEscrowByDocId(this.firebaseService, {
				docId,
				payload: updatedPayload,
			})

			if (result.success) {
				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'escrow_released',
					title: 'Escrow Released',
					message: `The escrow "${escrow.title}" has been released.`,
					entities: [escrow.receiver],
				})
			}

			return result
		} catch (error) {
			return {
				success: false,
				message:
					(error as Error).message || 'Failed to mark escrow as released.',
			}
		}
	}

	async updateMilestoneFlag(
		contractId: string,
		milestone_index: string,
		new_flag: boolean,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		const { docId, data, milestones } = await this.getMilestones(contractId)
		const index = Number.parseInt(milestone_index, 10)

		if (index < 0 || index >= data.milestones.length) {
			throw new Error(
				`Milestone index ${index} is out of range. Total milestones: ${data.milestones.length}`,
			)
		}

		const updatedMilestones = data.milestones.map((m: Milestone, i: number) => {
			if (i === index) {
				return {
					...m,
					approved_flag: new_flag,
					approvedAt: new_flag ? new Date() : null,
				}
			}
			return m
		})

		const result = await updateEscrow(this.firebaseService, {
			escrowId: contractId,
			payload: { milestones: updatedMilestones },
		})

		const milestone = updatedMilestones[index]

		if (result.success) {
			await createNotification(this.firebaseService, {
				contractId: data.contractId,
				type: 'milestone_approved',
				title: 'Milestone Approved',
				message: `The milestone "${milestone.description}" has been approved in "${data.title}".`,
				entities: [data.serviceProvider],
			})
		}

		return result
	}

	async updateMilestoneStatus(
		contractId: string,
		milestone_index: string,
		new_status: string,
		new_evidence: string,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		const { docId, data, milestones } = await this.getMilestones(contractId)
		const index = Number.parseInt(milestone_index, 10)

		if (index < 0 || index >= data.milestones.length) {
			throw new Error(
				`Milestone index ${index} is out of range. Total milestones: ${data.milestones.length}`,
			)
		}

		const updatedMilestones = data.milestones.map((m: Milestone, i: number) => {
			if (i === index) {
				return {
					...m,
					status: new_status,
					evidence: new_evidence,
					completedAt: new Date(),
				}
			}
			return m
		})

		const result = await updateEscrow(this.firebaseService, {
			escrowId: contractId,
			payload: { milestones: updatedMilestones },
		})

		const milestone = updatedMilestones[index]

		if (result.success) {
			await createNotification(this.firebaseService, {
				contractId: data.contractId,
				type: 'milestone_status_updated',
				title: 'Milestone Status Updated',
				message: `The milestone "${milestone.description}" has been updated to "${new_status}" in "${data.title}".`,
				entities: [data.approver],
			})
		}

		return result
	}

	async startDispute(
		contractId: string,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		try {
			const updatedPayload = {
				disputeFlag: true,
				updatedAt: new Date(),
			}

			const result = await updateEscrow(this.firebaseService, {
				escrowId: contractId,
				payload: updatedPayload,
			})

			if (result.success) {
				const { data: escrow } = await this.getDocByContractId(contractId)

				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'dispute_started',
					title: 'Dispute Started',
					message: `The escrow "${escrow.title}" is in dispute.`,
					entities: [
						escrow.approver,
						escrow.serviceProvider,
						escrow.platformAddress,
						escrow.releaseSigner,
						escrow.disputeResolver,
						escrow.receiver,
					],
				})
			}

			return result
		} catch (error) {
			return {
				success: false,
				message: (error as Error).message || 'Failed to start dispute.',
			}
		}
	}

	async resolveDispute(
		contractId: string,
		signer: string,
		approverFunds: string,
		receiverFunds: string,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		try {
			const updatedPayload = {
				resolvedFlag: true,
				disputeFlag: false,
				approverFunds,
				receiverFunds,
				updatedAt: new Date(),
			}

			const result = await updateEscrow(this.firebaseService, {
				escrowId: contractId,
				payload: updatedPayload,
			})

			if (result.success) {
				const { data: escrow } = await this.getDocByContractId(contractId)

				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'dispute_resolved',
					title: 'Dispute Resolved',
					message: `The escrow "${escrow.title}" has been resolved.`,
					entities: [escrow.approver, escrow.serviceProvider, escrow.receiver],
				})
			}

			return result
		} catch (error) {
			return {
				success: false,
				message:
					(error as Error).message || 'Failed to resolve dispute in Firestore.',
			}
		}
	}

	async updateEscrowData(
		contractId: string,
		signer: string,
		escrow: EscrowDto,
	): Promise<{ success: boolean; message: string; data?: unknown }> {
		try {
			const { id: docId } = await this.getDocByContractId(contractId)

			const updatedPayload = {
				...escrow,
				updatedAt: new Date(),
			}

			const result = await updateEscrowByDocId(this.firebaseService, {
				docId,
				payload: updatedPayload,
			})

			if (result.success) {
				const { data: escrow } = await this.getDocByContractId(contractId)

				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'escrow_updated',
					title: 'Escrow Updated',
					message: `The escrow "${escrow.title}" has been edited.`,
					entities: [
						escrow.approver,
						escrow.serviceProvider,
						escrow.platformAddress,
						escrow.releaseSigner,
						escrow.disputeResolver,
						escrow.receiver,
					],
				})
			}

			return result
		} catch (error) {
			return {
				success: false,
				message:
					(error as Error).message ||
					'Failed to update escrow data in Firestore.',
			}
		}
	}

	async getDocByContractId(contractId: string): Promise<{
		id: string
		data: FirebaseFirestore.DocumentData
	}> {
		const firestore = this.firebaseService.getFirestore()

		const snapshot = await firestore
			.collection('escrows')
			.where('contractId', '==', contractId)
			.get()

		if (snapshot.empty) {
			throw new Error('No escrow found with the given contractId')
		}

		const doc = snapshot.docs[0]

		return {
			id: doc.id,
			data: doc.data(),
		}
	}

	// ============================
	// Indexation Queries
	// ============================

	async getEscrowsBySigner(
		signer: string,
		page = 1,
		limit = 10,
	): Promise<{
		escrows: FirebaseFirestore.DocumentData[]
		total: number
		page: number
		limit: number
	}> {
		const firestore = this.firebaseService.getFirestore()
		const roleFields = [
			'approver',
			'serviceProvider',
			'receiver',
			'releaseSigner',
			'disputeResolver',
			'platformAddress',
		]

		const allDocs = new Map<string, FirebaseFirestore.DocumentData>()

		for (const role of roleFields) {
			const snapshot = await firestore
				.collection('escrows')
				.where(role, '==', signer)
				.get()

			for (const doc of snapshot.docs) {
				if (!allDocs.has(doc.id)) {
					allDocs.set(doc.id, { id: doc.id, ...doc.data() })
				}
			}
		}

		const allEscrows = Array.from(allDocs.values())
		const total = allEscrows.length
		const start = (page - 1) * limit
		const escrows = allEscrows.slice(start, start + limit)

		return { escrows, total, page, limit }
	}

	async getEscrowsByRole(
		role: string,
		wallet: string,
		page = 1,
		limit = 10,
	): Promise<{
		escrows: FirebaseFirestore.DocumentData[]
		total: number
		page: number
		limit: number
	}> {
		const firestore = this.firebaseService.getFirestore()

		const countSnapshot = await firestore
			.collection('escrows')
			.where(role, '==', wallet)
			.count()
			.get()
		const total = countSnapshot.data().count

		const snapshot = await firestore
			.collection('escrows')
			.where(role, '==', wallet)
			.orderBy('createdAt', 'desc')
			.offset((page - 1) * limit)
			.limit(limit)
			.get()

		const escrows = snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))

		return { escrows, total, page, limit }
	}

	async getEscrowsByEngagementId(
		engagementId: string,
	): Promise<FirebaseFirestore.DocumentData[]> {
		const firestore = this.firebaseService.getFirestore()

		const snapshot = await firestore
			.collection('escrows')
			.where('engagementId', '==', engagementId)
			.get()

		return snapshot.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}))
	}

	private async getMilestones(contractId: string): Promise<{
		docId: string
		data: FirebaseFirestore.DocumentData
		milestones: unknown[]
	}> {
		const firestore = this.firebaseService.getFirestore()

		const snapshot = await firestore
			.collection('escrows')
			.where('contractId', '==', contractId)
			.get()

		if (snapshot.empty) {
			throw new Error('No escrow found with given contractId')
		}

		const doc = snapshot.docs[0]
		const data = doc.data()

		if (!Array.isArray(data.milestones)) {
			throw new Error('No milestones array found in document.')
		}

		return {
			docId: doc.id,
			data,
			milestones: data.milestones,
		}
	}
}
