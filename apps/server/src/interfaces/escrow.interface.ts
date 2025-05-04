import type { Milestone } from './milestone.interface'

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
	originalCurrency: string
	originalAmount: string
	usdcAmount: string
	conversionTxHash: string
	conversionRate: string
	conversionTimestamp: number
}
