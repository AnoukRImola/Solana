import { useCallback } from 'react'
import type {
	RequestApiKeyParams,
	RequestApiKeyResponse,
} from '../../types/auth.types'
import { useTrustlessWork } from '../context'

export function useRequestApiKey() {
	const tw = useTrustlessWork()
	const requestApiKey = useCallback(
		(params: RequestApiKeyParams): Promise<RequestApiKeyResponse> =>
			tw.auth.requestApiKey(params),
		[tw],
	)
	return { requestApiKey }
}
