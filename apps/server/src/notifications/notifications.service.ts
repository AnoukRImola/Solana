import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { Escrow } from 'src/interfaces/escrow.interface'
import { Milestone } from 'src/interfaces/milestone.interface'
import { createNotification } from 'src/utils/firebase.utils'
import { FirebaseService } from '../firebase/firebase.service'

@Injectable()
export class NotificationsService {
	// private readonly logger = new Logger(NotificationsService.name);

	constructor(private readonly firebaseService: FirebaseService) {}

	@Cron(CronExpression.EVERY_HOUR) // ! ask: how often?
	async checkPendingEscrows() {
		const firestore = this.firebaseService.getFirestore()

		const escrowsSnapshot = await firestore.collection('escrows').get()

		const now = new Date()
		const X_DAYS = 7 // ! ask: how many days?
		const X_DAYS_AGO = new Date(now.getTime() - X_DAYS * 24 * 60 * 60 * 1000)

		for (const escrowDoc of escrowsSnapshot.docs) {
			const escrow = escrowDoc.data()
			const createdAt = escrow.createdAt?.toDate?.() ?? new Date(0)

			const isPending = escrow.milestones?.some(
				(milestone) => milestone.approved_flag !== true,
			)

			if (isPending && createdAt < X_DAYS_AGO) {
				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'escrow_stuck_pending',
					title: 'Escrow Stuck in Pending State',
					message: `Escrow ${escrow.title} has been in a pending state for more than ${X_DAYS} days.`,
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
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // ! ask: how often?
	async checkHighValueDisputes() {
		const firestore = this.firebaseService.getFirestore()

		const snapshot = await firestore
			.collection('escrows')
			.where('disputeFlag', '==', true)
			.get()

		const HIGH_VALUE_THRESHOLD = 500 // ! ask: how many USDC?
		for (const doc of snapshot.docs) {
			const escrow = doc.data() as Escrow
			if (Number(escrow.amount) > HIGH_VALUE_THRESHOLD) {
				// ! ask: amount or balance?
				await createNotification(this.firebaseService, {
					contractId: escrow.contractId ?? '',
					type: 'high_value_dispute',
					title: 'High Value Escrow in Dispute',
					message: `Escrow ${escrow.title} with value ${escrow.amount} is in dispute`,
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
		}
	}

	@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT) // ! ask: how often?
	async checkInactiveEscrows() {
		const firestore = this.firebaseService.getFirestore()

		const snapshot = await firestore.collection('escrows').get()

		const X_DAYS = 30 // ! ask: how many days?
		const X_DAYS_AGO = new Date(
			new Date().getTime() - X_DAYS * 24 * 60 * 60 * 1000,
		)

		for (const doc of snapshot.docs) {
			const escrow = doc.data()

			if (escrow.resolvedFlag == true || escrow.releaseFlag == true) continue // todo: @caleb, please set this filters in the query

			const lastActivity = escrow.updatedAt?.toDate?.() ?? new Date(0)

			if (lastActivity < X_DAYS_AGO) {
				await createNotification(this.firebaseService, {
					contractId: escrow.contractId,
					type: 'inactive_escrow',
					title: 'Inactive Escrow',
					message: `Escrow ${escrow.title} has had no activity for ${X_DAYS} days`,
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
		}
	}

	@Cron(CronExpression.EVERY_6_HOURS) // ! ask: how often?
	async checkCompletedMilestones() {
		const firestore = this.firebaseService.getFirestore()

		const snapshot = await firestore.collection('escrows').get()

		const X_DAYS = 3 // ! ask: how many days?
		const X_DAYS_AGO = new Date(
			new Date().getTime() - X_DAYS * 24 * 60 * 60 * 1000,
		)

		for (const doc of snapshot.docs) {
			const escrow = doc.data()

			if (escrow.resolvedFlag == true || escrow.releaseFlag == true) continue // todo: @caleb, please set this filters in the query

			if (escrow.milestones) {
				for (const milestone of escrow.milestones as Milestone[]) {
					if (milestone.status === 'completed' && !milestone.approved_flag) {
						const completedAt =
							milestone.completedAt instanceof Date
								? milestone.completedAt
								: new Date(0)

						if (completedAt < X_DAYS_AGO) {
							await createNotification(this.firebaseService, {
								contractId: escrow.contractId,
								type: 'milestone_pending_approval',
								title: 'Milestone Pending Approval',
								message: `Milestone "${milestone.description}" in escrow ${escrow.title} has been completed but not approved for ${X_DAYS} days`,
								entities: [escrow.approver],
							})
						}
					}
				}
			}
		}
	}
}
