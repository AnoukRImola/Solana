import axios from 'axios'
import type { ResolveDisputePayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'
import {
	signAndSerialize,
	type WalletSignTransaction,
} from '~/lib/solana-wallet'

export const resolveDispute = async (
	payload: ResolveDisputePayload,
	signTransaction: WalletSignTransaction,
) => {
	try {
		const response = await http.post('/escrow/resolving-disputes', payload)
		const { unsignedTransaction } = response.data

		const signedTx = await signAndSerialize(
			unsignedTransaction,
			signTransaction,
		)

		const tx = await http.post('/helper/send-transaction', {
			signedXdr: signedTx,
			queueKey: payload.contractId,
		})

		const { data } = tx
		return data
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error('Axios Error:', error.response?.data || error.message)
			throw new Error(error.response?.data?.message || 'Error resolving dispute')
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
