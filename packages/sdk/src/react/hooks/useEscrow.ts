import { useCallback } from 'react'
import { useTrustlessWork } from '../context'
import type { ApiResponse, EscrowData } from '../../types/common.types'
import type {
	FundEscrowParams,
	ReleaseFundsParams,
	ResolveDisputeParams,
	ChangeMilestoneApprovedFlagParams,
	ChangeMilestoneStatusParams,
	ChangeDisputeFlagParams,
	UpdateEscrowParams,
	GetEscrowParams,
} from '../../types/escrow.types'

export function useFundEscrow() {
	const tw = useTrustlessWork()
	const fundEscrow = useCallback(
		(params: FundEscrowParams): Promise<ApiResponse> =>
			tw.escrow.fundEscrow(params),
		[tw],
	)
	return { fundEscrow }
}

export function useReleaseFunds() {
	const tw = useTrustlessWork()
	const releaseFunds = useCallback(
		(params: ReleaseFundsParams): Promise<ApiResponse> =>
			tw.escrow.releaseFunds(params),
		[tw],
	)
	return { releaseFunds }
}

export function useResolveDispute() {
	const tw = useTrustlessWork()
	const resolveDispute = useCallback(
		(params: ResolveDisputeParams): Promise<ApiResponse> =>
			tw.escrow.resolveDispute(params),
		[tw],
	)
	return { resolveDispute }
}

export function useChangeMilestoneApprovedFlag() {
	const tw = useTrustlessWork()
	const changeMilestoneApprovedFlag = useCallback(
		(params: ChangeMilestoneApprovedFlagParams): Promise<ApiResponse> =>
			tw.escrow.changeMilestoneApprovedFlag(params),
		[tw],
	)
	return { changeMilestoneApprovedFlag }
}

export function useChangeMilestoneStatus() {
	const tw = useTrustlessWork()
	const changeMilestoneStatus = useCallback(
		(params: ChangeMilestoneStatusParams): Promise<ApiResponse> =>
			tw.escrow.changeMilestoneStatus(params),
		[tw],
	)
	return { changeMilestoneStatus }
}

export function useChangeDisputeFlag() {
	const tw = useTrustlessWork()
	const changeDisputeFlag = useCallback(
		(params: ChangeDisputeFlagParams): Promise<ApiResponse> =>
			tw.escrow.changeDisputeFlag(params),
		[tw],
	)
	return { changeDisputeFlag }
}

export function useUpdateEscrow() {
	const tw = useTrustlessWork()
	const updateEscrow = useCallback(
		(params: UpdateEscrowParams): Promise<ApiResponse> =>
			tw.escrow.updateEscrow(params),
		[tw],
	)
	return { updateEscrow }
}

export function useGetEscrow() {
	const tw = useTrustlessWork()
	const getEscrow = useCallback(
		(params: GetEscrowParams): Promise<EscrowData | ApiResponse> =>
			tw.escrow.getEscrow(params),
		[tw],
	)
	return { getEscrow }
}
