import type { AxiosInstance } from 'axios'
import type { ApiResponse } from '../../types/common.types'
import type {
	GetAuditLogsParams,
	GetEscrowComplianceParams,
	GetEscrowsByEngagementParams,
	GetEscrowsByRoleParams,
	GetEscrowsBySignerParams,
	GetSuspiciousActivityParams,
	GetVerificationParams,
	InitializeRegistryParams,
	RevokeVerificationParams,
	SetEscrowComplianceParams,
	SetTravelRuleDataParams,
	VerifyAddressParams,
} from '../../types/compliance.types'

export function createComplianceModule(http: AxiosInstance) {
	return {
		async initializeRegistry(
			params: InitializeRegistryParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/compliance/initialize-registry',
				params,
			)
			return data
		},

		async verifyAddress(params: VerifyAddressParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/compliance/verify-address',
				params,
			)
			return data
		},

		async revokeVerification(
			params: RevokeVerificationParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/compliance/revoke-verification',
				params,
			)
			return data
		},

		async setEscrowCompliance(
			params: SetEscrowComplianceParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/compliance/set-escrow-compliance',
				params,
			)
			return data
		},

		async setTravelRuleData(
			params: SetTravelRuleDataParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/compliance/set-travel-rule-data',
				params,
			)
			return data
		},

		async getRegistry(): Promise<unknown> {
			const { data } = await http.get('/compliance/registry')
			return data
		},

		async getVerification(params: GetVerificationParams): Promise<unknown> {
			const { data } = await http.get('/compliance/verification', { params })
			return data
		},

		async getEscrowCompliance(
			params: GetEscrowComplianceParams,
		): Promise<unknown> {
			const { data } = await http.get('/compliance/escrow-compliance', {
				params,
			})
			return data
		},

		async getAuditLogs(params: GetAuditLogsParams): Promise<unknown> {
			const { data } = await http.get('/compliance/audit-logs', { params })
			return data
		},

		async getSuspiciousActivity(
			params: GetSuspiciousActivityParams,
		): Promise<unknown> {
			const { data } = await http.get('/compliance/suspicious-activity', {
				params,
			})
			return data
		},

		async getEscrowsBySigner(
			params: GetEscrowsBySignerParams,
		): Promise<unknown> {
			const { data } = await http.get('/compliance/escrows/by-signer', {
				params,
			})
			return data
		},

		async getEscrowsByRole(params: GetEscrowsByRoleParams): Promise<unknown> {
			const { data } = await http.get('/compliance/escrows/by-role', { params })
			return data
		},

		async getEscrowsByEngagement(
			params: GetEscrowsByEngagementParams,
		): Promise<unknown> {
			const { data } = await http.get('/compliance/escrows/by-engagement', {
				params,
			})
			return data
		},
	}
}

export type ComplianceModule = ReturnType<typeof createComplianceModule>
