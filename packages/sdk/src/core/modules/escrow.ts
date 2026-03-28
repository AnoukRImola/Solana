import type { AxiosInstance } from 'axios'
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

export function createEscrowModule(http: AxiosInstance) {
	return {
		async fundEscrow(params: FundEscrowParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>('/escrow/fund-escrow', params)
			return data
		},

		async releaseFunds(params: ReleaseFundsParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>('/escrow/release-funds', params)
			return data
		},

		async resolveDispute(params: ResolveDisputeParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>('/escrow/resolving-disputes', params)
			return data
		},

		async changeMilestoneApprovedFlag(
			params: ChangeMilestoneApprovedFlagParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/change-milestone-approved-flag',
				params,
			)
			return data
		},

		async changeMilestoneStatus(
			params: ChangeMilestoneStatusParams,
		): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/change-milestone-status',
				params,
			)
			return data
		},

		async changeDisputeFlag(params: ChangeDisputeFlagParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/escrow/change-dispute-flag',
				params,
			)
			return data
		},

		async updateEscrow(params: UpdateEscrowParams): Promise<ApiResponse> {
			const { data } = await http.put<ApiResponse>(
				'/escrow/update-escrow-by-contract-id',
				params,
			)
			return data
		},

		async getEscrow(
			params: GetEscrowParams,
		): Promise<EscrowData | ApiResponse> {
			const { data } = await http.get<EscrowData | ApiResponse>(
				'/escrow/get-escrow-by-contract-id',
				{ params },
			)
			return data
		},
	}
}

export type EscrowModule = ReturnType<typeof createEscrowModule>
