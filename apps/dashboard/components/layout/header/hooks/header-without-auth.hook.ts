'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGlobalAuthenticationStore } from '~/core/store/data'

const useHeaderWithoutAuth = () => {
	const { address } = useGlobalAuthenticationStore()
	const router = useRouter()

	useEffect(() => {
		if (address) {
			router.push('/dashboard')
		}
	}, [address, router])

	const handleRequestApiKey = () => {
		router.push('/request-api-key')
	}

	const handleReportIssue = () => {
		router.push('/report-issue')
	}

	return { handleRequestApiKey, handleReportIssue, address }
}

export default useHeaderWithoutAuth
