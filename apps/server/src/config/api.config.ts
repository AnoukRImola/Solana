export const apiConfig = {
	jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
	wasmHash: process.env.WASM_HASH || '',
	stellarNetwork: process.env.USDC_STELLAR_CIRCLE_TEST_TOKEN || '',
	serverURL: process.env.SERVER_URL || '',
	sorobanServerURL: process.env.SOROBAN_SERVER_URL || '',
	trustlessContractId: process.env.TRUSTLESS_CONTRACT_ID || '',
	trustlessAddress: process.env.TRUSTLESS_ADDRESS || '',
	solanaPayerSecretKeyJSON: process.env.SOLANA_PAYER_SECRET_KEY_JSON || '',
	port: process.env.PORT || 3000,
} as const
