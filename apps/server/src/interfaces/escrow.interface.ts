import { PublicKey } from '@solana/web3.js'
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
	amount: number
	platformFee: number
	receiverMemo: number
	trustlineDecimals: number
	disputeFlag: boolean
	releaseFlag: boolean
	resolvedFlag: boolean
	milestones: Milestone[]
	swapData?: EscrowSwapData
	contractId?: string
}

export interface EscrowSwapData {
	originalAmount: string
	originalCurrency: string
	tokenAmount: string
	tokenCurrency: string
	conversionTxHash: string
	conversionRate: string
	conversionTimestamp: number
}

export interface EscrowStructure {
	title: string
	amount: string
	description: string
	engagementId: string
	receiver: PublicKey
	approver: PublicKey
	trustline: PublicKey
	releaseSigner: PublicKey
	serviceProvider: PublicKey
	disputeResolver: PublicKey
	platformAddress: PublicKey
	platformFee: number
	receiverMemo: number
	trustlineDecimals: number
	disputeFlag: boolean
	releaseFlag: boolean
	resolvedFlag: boolean
	milestones: Milestone[]
	swapData?: EscrowSwapData
	contractId?: string
}
