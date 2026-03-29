import type { AxiosInstance } from 'axios'
import type {
	RequestApiKeyParams,
	RequestApiKeyResponse,
} from '../../types/auth.types'

export function createAuthModule(http: AxiosInstance) {
	return {
		async requestApiKey(
			params: RequestApiKeyParams,
		): Promise<RequestApiKeyResponse> {
			const { data } = await http.post<RequestApiKeyResponse>(
				'/auth/request-api-key',
				params,
			)
			return data
		},
	}
}

export type AuthModule = ReturnType<typeof createAuthModule>
