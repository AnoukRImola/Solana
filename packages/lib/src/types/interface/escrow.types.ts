import type { Milestone } from './milestone.types'

export interface Escrow {
	contractId?: string
	engagementId: string
	title: string
	description: string
	approver: string
	serviceProvider: string
	platformAddress: string
	amount: number
	platformFee: number
	milestones: Milestone[]
	releaseSigner: string
	disputeResolver: string
	disputeFlag: string
	releaseFlag: string
	resolvedFlag: string
	trustline: string
	trustline_decimals: number
	receiver: string
	receiver_memo: number
	swapData?: EscrowSwapData
}

export interface EscrowSwapData {
	originalAmount: string
	originalCurrency: string
	usdcAmount: string
	conversionRate: string
	conversionTimestamp: number
	unsignedSwapTxHash?: string
}
