import type { TravelRuleData } from './common.types'

export interface InitializeRegistryParams {
	signer: string
	travelRuleThreshold: string
}

export interface VerifyAddressParams {
	signer: string
	address: string
	kycProvider: string
	jurisdiction: string
	riskScore: number
}

export interface RevokeVerificationParams {
	signer: string
	address: string
}

export interface SetEscrowComplianceParams {
	signer: string
	escrowAddress: string
	requiresKyc: boolean
}

export interface SetTravelRuleDataParams {
	signer: string
	escrowAddress: string
	travelRuleData: TravelRuleData
}

export interface GetVerificationParams {
	address: string
}

export interface GetEscrowComplianceParams {
	escrowAddress: string
}

export interface GetEscrowsBySignerParams {
	signer: string
	page?: number
	limit?: number
}

export interface GetEscrowsByRoleParams {
	role:
		| 'approver'
		| 'serviceProvider'
		| 'receiver'
		| 'releaseSigner'
		| 'disputeResolver'
		| 'platformAddress'
	wallet: string
	page?: number
	limit?: number
}

export interface GetEscrowsByEngagementParams {
	engagementId: string
}

export interface GetAuditLogsParams {
	wallet: string
	page?: string
	limit?: string
}

export interface GetSuspiciousActivityParams {
	wallet: string
}
