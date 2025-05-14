import axios from 'axios'
import type { EscrowPayload } from '~/@types/escrow.entity'
import http from '~/core/config/axios/http'
import { signTransaction } from '~/lib/stellar-wallet-kit'

interface EscrowPayloadWithSigner extends EscrowPayload {
	signer?: string
	trustlineDecimals: number | undefined
}

export const initializeEscrow = async (
	payload: EscrowPayloadWithSigner,
	address: string,
) => {
	try {
		const payloadWithSigner: EscrowPayloadWithSigner = {
			...payload,
			signer: address,
		}

		const response = await http.post(
			'/deployer/invoke-deployer-contract',
			payloadWithSigner,
		)

		const { unsignedTransaction } = response.data

		const signedTxXdr = await signTransaction({ unsignedTransaction, address })

		const tx = await http.post('/helper/send-transaction', {
			signedXdr: signedTxXdr,
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
			// biome-ignore lint/style/noUselessElse: <explanation>
		} else {
			console.error('Unexpected Error:', error)
			throw new Error('Unexpected error occurred')
		}
	}
}
