import { useCallback } from 'react'
import type { ApiResponse } from '../../types/common.types'
import type {
	CloseRegistryParams,
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
import { useTrustlessWork } from '../context'

export function useInitializeRegistry() {
	const tw = useTrustlessWork()
	const initializeRegistry = useCallback(
		(params: InitializeRegistryParams): Promise<ApiResponse> =>
			tw.compliance.initializeRegistry(params),
		[tw],
	)
	return { initializeRegistry }
}

export function useVerifyAddress() {
	const tw = useTrustlessWork()
	const verifyAddress = useCallback(
		(params: VerifyAddressParams): Promise<ApiResponse> =>
			tw.compliance.verifyAddress(params),
		[tw],
	)
	return { verifyAddress }
}

export function useRevokeVerification() {
	const tw = useTrustlessWork()
	const revokeVerification = useCallback(
		(params: RevokeVerificationParams): Promise<ApiResponse> =>
			tw.compliance.revokeVerification(params),
		[tw],
	)
	return { revokeVerification }
}

export function useSetEscrowCompliance() {
	const tw = useTrustlessWork()
	const setEscrowCompliance = useCallback(
		(params: SetEscrowComplianceParams): Promise<ApiResponse> =>
			tw.compliance.setEscrowCompliance(params),
		[tw],
	)
	return { setEscrowCompliance }
}

export function useSetTravelRuleData() {
	const tw = useTrustlessWork()
	const setTravelRuleData = useCallback(
		(params: SetTravelRuleDataParams): Promise<ApiResponse> =>
			tw.compliance.setTravelRuleData(params),
		[tw],
	)
	return { setTravelRuleData }
}

export function useCloseRegistry() {
	const tw = useTrustlessWork()
	const closeRegistry = useCallback(
		(params: CloseRegistryParams): Promise<ApiResponse> =>
			tw.compliance.closeRegistry(params),
		[tw],
	)
	return { closeRegistry }
}

export function useGetRegistry() {
	const tw = useTrustlessWork()
	const getRegistry = useCallback(
		(): Promise<unknown> => tw.compliance.getRegistry(),
		[tw],
	)
	return { getRegistry }
}

export function useGetVerification() {
	const tw = useTrustlessWork()
	const getVerification = useCallback(
		(params: GetVerificationParams): Promise<unknown> =>
			tw.compliance.getVerification(params),
		[tw],
	)
	return { getVerification }
}

export function useGetEscrowCompliance() {
	const tw = useTrustlessWork()
	const getEscrowCompliance = useCallback(
		(params: GetEscrowComplianceParams): Promise<unknown> =>
			tw.compliance.getEscrowCompliance(params),
		[tw],
	)
	return { getEscrowCompliance }
}

export function useGetAuditLogs() {
	const tw = useTrustlessWork()
	const getAuditLogs = useCallback(
		(params: GetAuditLogsParams): Promise<unknown> =>
			tw.compliance.getAuditLogs(params),
		[tw],
	)
	return { getAuditLogs }
}

export function useGetSuspiciousActivity() {
	const tw = useTrustlessWork()
	const getSuspiciousActivity = useCallback(
		(params: GetSuspiciousActivityParams): Promise<unknown> =>
			tw.compliance.getSuspiciousActivity(params),
		[tw],
	)
	return { getSuspiciousActivity }
}

export function useGetEscrowsBySigner() {
	const tw = useTrustlessWork()
	const getEscrowsBySigner = useCallback(
		(params: GetEscrowsBySignerParams): Promise<unknown> =>
			tw.compliance.getEscrowsBySigner(params),
		[tw],
	)
	return { getEscrowsBySigner }
}

export function useGetEscrowsByRole() {
	const tw = useTrustlessWork()
	const getEscrowsByRole = useCallback(
		(params: GetEscrowsByRoleParams): Promise<unknown> =>
			tw.compliance.getEscrowsByRole(params),
		[tw],
	)
	return { getEscrowsByRole }
}

export function useGetEscrowsByEngagement() {
	const tw = useTrustlessWork()
	const getEscrowsByEngagement = useCallback(
		(params: GetEscrowsByEngagementParams): Promise<unknown> =>
			tw.compliance.getEscrowsByEngagement(params),
		[tw],
	)
	return { getEscrowsByEngagement }
}
