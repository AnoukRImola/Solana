import type { Milestone, MultiReleaseMilestone } from './common.types'

export interface DeploySingleReleaseParams {
	signer: string
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

export interface DeployMultiReleaseParams {
	signer: string
	engagementId: string
	title: string
	description: string
	approver: string
	serviceProvider: string
	platformAddress: string
	platformFee: string
	milestones: MultiReleaseMilestone[]
	releaseSigner: string
	disputeResolver: string
	trustline: string
	trustlineDecimals: number
}
