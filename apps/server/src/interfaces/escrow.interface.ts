import type { Milestone } from './milestone.interface'

export interface Escrow {
	title: string
	description: string
	engagementId: string
	receiver: string
	trustline: string
	approver: string
	releaseSigner: string
	serviceProvider: string
	disputeResolver: string
	platformAddress: string
	amount: number | string
	platformFee: number | string
	receiverMemo: number | string
	trustlineDecimals: number
	disputeFlag: boolean
	releaseFlag: boolean
	resolvedFlag: boolean
	milestones: Milestone[]
	contractId?: string
}
