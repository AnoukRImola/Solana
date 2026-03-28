export interface MultiReleaseFundEscrowParams {
	contractId: string
	signer: string
	amount: string
}

export interface MultiReleaseMilestoneStatusParams {
	contractId: string
	milestoneIndex: string
	newStatus: string
	newEvidence?: string
	serviceProvider: string
}

export interface MultiReleaseApproveMilestoneParams {
	contractId: string
	milestoneIndex: string
	approved: boolean
	approver: string
}

export interface MultiReleaseMilestoneOperationParams {
	contractId: string
	milestoneIndex: string
	signer: string
}

export interface MultiReleaseDisputeResolutionParams {
	contractId: string
	milestoneIndex: string
	disputeResolver: string
	approverFunds: string
	receiverFunds: string
}

export interface MultiReleaseWithdrawRemainingFundsParams {
	contractId: string
	approver: string
}
