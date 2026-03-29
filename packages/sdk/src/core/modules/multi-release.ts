import type { AxiosInstance } from 'axios'
import type { ApiResponse } from '../../types/common.types'
import type {
	MultiReleaseApproveMilestoneParams,
	MultiReleaseDisputeResolutionParams,
	MultiReleaseFundEscrowParams,
	MultiReleaseMilestoneOperationParams,
	MultiReleaseMilestoneStatusParams,
	MultiReleaseWithdrawRemainingFundsParams,
} from '../../types/multi-release.types'

export function createMultiReleaseModule(http: AxiosInstance) {
	return {
		async fundEscrow(
			params: MultiReleaseFundEscrowParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/fund-escrow',
				params,
			)
			return data
		},

		async changeMilestoneStatus(
			params: MultiReleaseMilestoneStatusParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/change-milestone-status',
				params,
			)
			return data
		},

		async approveMilestone(
			params: MultiReleaseApproveMilestoneParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/approve-milestone',
				params,
			)
			return data
		},

		async releaseMilestoneFunds(
			params: MultiReleaseMilestoneOperationParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/release-milestone-funds',
				params,
			)
			return data
		},

		async disputeMilestone(
			params: MultiReleaseMilestoneOperationParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/dispute-milestone',
				params,
			)
			return data
		},

		async resolveMilestoneDispute(
			params: MultiReleaseDisputeResolutionParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/resolve-milestone-dispute',
				params,
			)
			return data
		},

		async withdrawRemainingFunds(
			params: MultiReleaseWithdrawRemainingFundsParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/multi-release/withdraw-remaining-funds',
				params,
			)
			return data
		},
	}
}

export type MultiReleaseModule = ReturnType<typeof createMultiReleaseModule>
