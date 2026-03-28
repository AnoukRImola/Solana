import { useCallback } from 'react'
import { useTrustlessWork } from '../context'
import type { ApiResponse } from '../../types/common.types'
import type {
	DeploySingleReleaseParams,
	DeployMultiReleaseParams,
} from '../../types/deployer.types'

export function useDeploySingleRelease() {
	const tw = useTrustlessWork()
	const deploySingleRelease = useCallback(
		(params: DeploySingleReleaseParams): Promise<ApiResponse> =>
			tw.deployer.deploySingleRelease(params),
		[tw],
	)
	return { deploySingleRelease }
}

export function useDeployMultiRelease() {
	const tw = useTrustlessWork()
	const deployMultiRelease = useCallback(
		(params: DeployMultiReleaseParams): Promise<ApiResponse> =>
			tw.deployer.deployMultiRelease(params),
		[tw],
	)
	return { deployMultiRelease }
}
