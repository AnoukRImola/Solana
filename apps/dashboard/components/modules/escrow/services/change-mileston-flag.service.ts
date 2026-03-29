import axios from 'axios'
import type { ChangeMilestoneFlagPayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'
import {
	type WalletSignTransaction,
	signAndSerialize,
} from '~/lib/solana-wallet'

export const changeMilestoneFlag = async (
	payload: ChangeMilestoneFlagPayload,
	signTransaction: WalletSignTransaction,
) => {
	try {
		const response = await http.post(
			'/escrow/change-milestone-approved-flag',
			payload,
		)
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
			throw new Error(
				error.response?.data?.message || 'Error changing milestone flag',
			)
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
