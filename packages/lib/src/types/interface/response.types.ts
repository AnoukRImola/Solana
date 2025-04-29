import type * as StellarSDK from '@stellar/stellar-sdk'
import type { Milestone } from './milestone.types'

export interface ApiResponse {
	status: StellarSDK.rpc.Api.GetTransactionStatus
	unsignedTransaction?: string
	unsignedConversionTransaction?: string
	message?: string
	contract_id?: string
	engagement_id?: string
	escrow?: escrowCamelCaseResponse
}

export interface escrowResponse {
	engagementId: string
	title: string
	description: string
	approver: string
	service_provider: string
	platform_address: string
	amount: number
	platform_fee: number
	milestones: Milestone[]
	release_signer: string
	dispute_resolver: string
	dispute_flag: string
}

export interface escrowCamelCaseResponse {
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
