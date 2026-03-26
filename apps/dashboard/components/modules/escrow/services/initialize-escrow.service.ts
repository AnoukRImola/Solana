import axios from 'axios'
import type { EscrowPayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'
import {
	signAndSerialize,
	type WalletSignTransaction,
} from '~/lib/solana-wallet'

interface EscrowPayloadWithSigner extends EscrowPayload {
	signer?: string
	trustlineDecimals: number | undefined
}

export const initializeEscrow = async (
	payload: EscrowPayloadWithSigner,
	address: string,
	signTransaction: WalletSignTransaction,
) => {
	try {
		const payloadWithSigner: EscrowPayloadWithSigner = {
			...payload,
			signer: address,
		}

		const response = await http.post(
			'/deployer/single-release',
			payloadWithSigner,
		)

		const { unsignedTransaction, contract_id } = response.data

		const signedTx = await signAndSerialize(
			unsignedTransaction,
			signTransaction,
		)

		const tx = await http.post('/helper/send-transaction', {
			signedXdr: signedTx,
			queueKey: contract_id,
			returnEscrowDataIsRequired: true,
		})

		const { data } = tx

		return data
	} catch (error: unknown) {
		if (axios.isAxiosError(error)) {
			console.error('Axios Error:', error.response?.data || error.message)
			throw new Error(
				error.response?.data?.message || 'Error initializing escrow',
			)
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
