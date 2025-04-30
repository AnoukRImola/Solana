import axios from 'axios'
import http from '~/core/config/axios/http'

export const getBalance = async (signer: string, addresses: string[]) => {
	try {
		const response = await http.get('/helper/get-multiple-escrow-balance', {
			params: { addresses, signer },
		})

		return response
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error('Axios Error:', error.response?.data || error.message)
			throw new Error(
				error.response?.data?.message || 'Error initializing escrow',
			)
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
