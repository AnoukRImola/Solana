import type { AxiosInstance } from 'axios'
import type { ApiResponse } from '../../types/common.types'
import type {
	DeploySingleReleaseParams,
	DeployMultiReleaseParams,
} from '../../types/deployer.types'

export function createDeployerModule(http: AxiosInstance) {
	return {
		async deploySingleRelease(params: DeploySingleReleaseParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>('/deployer/single-release', params)
			return data
		},

		async deployMultiRelease(params: DeployMultiReleaseParams): Promise<ApiResponse> {
			const { data } = await http.post<ApiResponse>('/deployer/multi-release', params)
			return data
		},
	}
}

export type DeployerModule = ReturnType<typeof createDeployerModule>
