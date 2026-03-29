import { useCallback } from 'react'
import type { ApiResponse } from '../../types/common.types'
import type {
	DeployMultiReleaseParams,
	DeploySingleReleaseParams,
} from '../../types/deployer.types'
import { useTrustlessWork } from '../context'

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
