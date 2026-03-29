import { type ReactNode, useMemo } from 'react'
import { TrustlessWork } from '../core/client'
import { TrustlessWorkContext } from './context'

export interface TrustlessWorkConfigProps {
	baseURL: string
	apiKey?: string
	children: ReactNode
}

export function TrustlessWorkConfig({
	baseURL,
	apiKey,
	children,
}: TrustlessWorkConfigProps) {
	const client = useMemo(
		() => new TrustlessWork({ baseURL, apiKey }),
		[baseURL, apiKey],
	)

	return (
		<TrustlessWorkContext.Provider value={client}>
			{children}
		</TrustlessWorkContext.Provider>
	)
}
