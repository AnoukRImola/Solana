export interface RequestApiKeyParams {
	wallet: string
}

export interface RequestApiKeyResponse {
	wallet: string
	address: string
	createdAt: string
	token: string
	[key: string]: unknown
}
