import axios from 'axios'
import type { StartDisputePayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'

// TODO: PR7 — Sign with Solana wallet adapter instead of Stellar kit

export const startDispute = async (payload: StartDisputePayload) => {
	try {
		const response = await http.post('/escrow/change-dispute-flag', payload)
		const { unsignedTransaction } = response.data

		// TODO: PR7 — Replace with Solana wallet signTransaction
		const signedTx = unsignedTransaction

		const tx = await http.post('/helper/send-transaction', {
			signedXdr: signedTx,
		})

		const { data } = tx
		return data
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error('Axios Error:', error.response?.data || error.message)
			throw new Error(error.response?.data?.message || 'Error in Axios request')
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
