export interface Milestone {
	description: string
	status: string
	evidence: string
	approved_flag?: boolean
	approvedAt?: string
	completedAt?: string
}

export interface MultiReleaseMilestone {
	description: string
	amount: string
	receiver: string
}

export interface TravelRuleData {
	originatorName: string
	originatorAccount: string
	originatorJurisdiction: string
	beneficiaryName: string
	beneficiaryAccount: string
	beneficiaryJurisdiction: string
	transferPurpose: string
}

export interface EscrowData {
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
}

export interface ApiResponse {
	status: string
	unsignedTransaction?: string
	unsignedConversionTransaction?: string
	message?: string
	contract_id?: string
	engagement_id?: string
	escrow?: EscrowData
}
