import { createContext, useContext } from 'react'
import type { TrustlessWork } from '../core/client'

export const TrustlessWorkContext = createContext<TrustlessWork | null>(null)

export function useTrustlessWork(): TrustlessWork {
	const client = useContext(TrustlessWorkContext)
	if (!client) {
		throw new Error(
			'useTrustlessWork must be used within a <TrustlessWorkConfig> provider',
		)
	}
	return client
}
