import { useCallback } from 'react'
import { useTrustlessWork } from '../context'
import type { RequestApiKeyParams, RequestApiKeyResponse } from '../../types/auth.types'

export function useRequestApiKey() {
	const tw = useTrustlessWork()
	const requestApiKey = useCallback(
		(params: RequestApiKeyParams): Promise<RequestApiKeyResponse> =>
			tw.auth.requestApiKey(params),
		[tw],
	)
	return { requestApiKey }
}
