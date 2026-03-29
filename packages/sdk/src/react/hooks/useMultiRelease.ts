import { useCallback } from 'react'
import type { ApiResponse } from '../../types/common.types'
import type {
	MultiReleaseApproveMilestoneParams,
	MultiReleaseDisputeResolutionParams,
	MultiReleaseFundEscrowParams,
	MultiReleaseMilestoneOperationParams,
	MultiReleaseMilestoneStatusParams,
	MultiReleaseWithdrawRemainingFundsParams,
} from '../../types/multi-release.types'
import { useTrustlessWork } from '../context'

export function useMultiReleaseFundEscrow() {
	const tw = useTrustlessWork()
	const fundEscrow = useCallback(
		(params: MultiReleaseFundEscrowParams): Promise<ApiResponse> =>
			tw.multiRelease.fundEscrow(params),
		[tw],
	)
	return { fundEscrow }
}

export function useMultiReleaseChangeMilestoneStatus() {
	const tw = useTrustlessWork()
	const changeMilestoneStatus = useCallback(
		(params: MultiReleaseMilestoneStatusParams): Promise<ApiResponse> =>
			tw.multiRelease.changeMilestoneStatus(params),
		[tw],
	)
	return { changeMilestoneStatus }
}

export function useMultiReleaseApproveMilestone() {
	const tw = useTrustlessWork()
	const approveMilestone = useCallback(
		(params: MultiReleaseApproveMilestoneParams): Promise<ApiResponse> =>
			tw.multiRelease.approveMilestone(params),
		[tw],
	)
	return { approveMilestone }
}

export function useMultiReleaseReleaseMilestoneFunds() {
	const tw = useTrustlessWork()
	const releaseMilestoneFunds = useCallback(
		(params: MultiReleaseMilestoneOperationParams): Promise<ApiResponse> =>
			tw.multiRelease.releaseMilestoneFunds(params),
		[tw],
	)
	return { releaseMilestoneFunds }
}

export function useMultiReleaseDisputeMilestone() {
	const tw = useTrustlessWork()
	const disputeMilestone = useCallback(
		(params: MultiReleaseMilestoneOperationParams): Promise<ApiResponse> =>
			tw.multiRelease.disputeMilestone(params),
		[tw],
	)
	return { disputeMilestone }
}

export function useMultiReleaseResolveMilestoneDispute() {
	const tw = useTrustlessWork()
	const resolveMilestoneDispute = useCallback(
		(params: MultiReleaseDisputeResolutionParams): Promise<ApiResponse> =>
			tw.multiRelease.resolveMilestoneDispute(params),
		[tw],
	)
	return { resolveMilestoneDispute }
}

export function useMultiReleaseWithdrawRemainingFunds() {
	const tw = useTrustlessWork()
	const withdrawRemainingFunds = useCallback(
		(params: MultiReleaseWithdrawRemainingFundsParams): Promise<ApiResponse> =>
			tw.multiRelease.withdrawRemainingFunds(params),
		[tw],
	)
	return { withdrawRemainingFunds }
}
