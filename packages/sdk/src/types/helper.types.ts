export interface SendTransactionParams {
	signedXdr: string
	queueKey: string
	returnEscrowDataIsRequired?: boolean
	saveInfo?: boolean
}

export interface SetTrustlineParams {
	walletAddress: string
}

export interface GetMultipleEscrowBalanceParams {
	signer: string
	addresses?: string[]
}

export interface BalanceItem {
	address: string
	balance: number
}
