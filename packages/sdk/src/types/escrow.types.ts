import type { Milestone } from './common.types'

export interface FundEscrowParams {
	contractId: string
	signer: string
	amount: string
}

export interface ReleaseFundsParams {
	contractId: string
	releaseSigner: string
}

export interface ResolveDisputeParams {
	contractId: string
	disputeResolver: string
	approverFunds: string
	receiverFunds: string
}

export interface ChangeMilestoneApprovedFlagParams {
	contractId: string
	milestoneIndex: string
	newFlag: boolean
	approver: string
}

export interface ChangeMilestoneStatusParams {
	contractId: string
	milestoneIndex: string
	newStatus: string
	newEvidence?: string
	serviceProvider: string
}

export interface ChangeDisputeFlagParams {
	contractId: string
	signer: string
}

export interface UpdateEscrowParams {
	signer: string
	contractId: string
	escrow: {
		engagementId: string
		title: string
		description: string
		approver: string
		serviceProvider: string
		platformAddress: string
		amount: string
		platformFee: string
		milestones: Milestone[]
		releaseSigner: string
		disputeResolver: string
		trustline: string
		trustlineDecimals: number
		receiver: string
		receiverMemo: number
	}
}

export interface GetEscrowParams {
	signer: string
	contractId: string
}
