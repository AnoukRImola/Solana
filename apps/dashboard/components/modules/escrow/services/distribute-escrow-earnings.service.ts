import axios from 'axios'
import type { DistributeEscrowEarningsEscrowPayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'
import {
	type WalletSignTransaction,
	signAndSerialize,
} from '~/lib/solana-wallet'

export const distributeEscrowEarnings = async (
	payload: DistributeEscrowEarningsEscrowPayload,
	signTransaction: WalletSignTransaction,
) => {
	try {
		const response = await http.post('/escrow/release-funds', payload)
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
			console.error('Axios Error:', error.response?.data.message)
			throw new Error(error.response?.data?.message)
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
