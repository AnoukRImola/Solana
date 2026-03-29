import type { AxiosInstance } from 'axios'
import type { ApiResponse } from '../../types/common.types'
import type {
	BalanceItem,
	GetMultipleEscrowBalanceParams,
	SendTransactionParams,
	SetTrustlineParams,
} from '../../types/helper.types'

export function createHelperModule(http: AxiosInstance) {
	return {
		async sendTransaction(params: SendTransactionParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/helper/send-transaction',
				params,
			)
			return data
		},

		async setTrustline(params: SetTrustlineParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>(
				'/helper/set-trustline',
				params,
			)
			return data
		},

		async getMultipleEscrowBalance(
			params: GetMultipleEscrowBalanceParams,
		): Promise<BalanceItem[]> {
			const { data } = await http.get<BalanceItem[]>(
				'/helper/get-multiple-escrow-balance',
				{ params },
			)
			return data
		},
	}
}

export type HelperModule = ReturnType<typeof createHelperModule>
