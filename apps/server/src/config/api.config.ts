export const apiConfig = {
	jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
	wasmHash: process.env.WASM_HASH || '',
	stellarNetwork: process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN || '',
	serverURL: process.env.SERVER_URL || '',
	solanaServerURL:
		process.env.SOLANA_SERVER_URL || 'https://api.devnet.solana.com',
	trustlessContractId: process.env.TRUSTLESS_CONTRACT_ID || '',
	trustlessAddress: process.env.TRUSTLESS_ADDRESS || '',
	solanaPayerSecretKeyJSON: process.env.SOLANA_PAYER_SECRET_KEY_JSON || '',
	solanaProgramId: process.env.SOLANA_PROGRAM_ID || '',
	port: process.env.PORT || 3000,
} as const
