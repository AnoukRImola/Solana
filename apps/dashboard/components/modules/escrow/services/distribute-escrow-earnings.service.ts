import axios from 'axios'
import type { DistributeEscrowEarningsEscrowPayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'

// TODO: PR7 — Sign with Solana wallet adapter instead of Stellar kit

export const distributeEscrowEarnings = async (
	payload: DistributeEscrowEarningsEscrowPayload,
) => {
	try {
		const response = await http.post(
			'/escrow/distribute-escrow-earnings',
			payload,
		)
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
			console.error('Axios Error:', error.response?.data.message)
			throw new Error(error.response?.data?.message)
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
