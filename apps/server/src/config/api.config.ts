export const apiConfig = {
	jwtSecret: process.env.JWT_SECRET || 'default_jwt_secret',
	solanaServerURL:
		process.env.SOLANA_SERVER_URL || 'https://api.devnet.solana.com',
	trustlessContractId: process.env.TRUSTLESS_CONTRACT_ID || '',
	solanaPayerSecretKeyJSON: process.env.SOLANA_PAYER_SECRET_KEY_JSON || '',
	solanaProgramId:
		process.env.SOLANA_PROGRAM_ID ||
		'A2f8EQ1iYEFLkiN1UTDBkMYKR2Hxw7vqBb8srcVjGxk4',
	trustlessWorkFeeWallet: process.env.TRUSTLESS_WORK_FEE_WALLET || '',
	port: process.env.PORT || 3000,
} as const
