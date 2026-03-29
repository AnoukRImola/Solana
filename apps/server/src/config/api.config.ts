export const apiConfig = {
	jwtSecret:
		process.env.JWT_SECRET ||
		(() => {
			throw new Error('JWT_SECRET environment variable is required')
		})(),
	solanaServerURL:
		process.env.SOLANA_SERVER_URL || 'https://api.devnet.solana.com',
	trustlessContractId: process.env.TRUSTLESS_CONTRACT_ID || '',
	solanaPayerSecretKeyJSON: process.env.SOLANA_PAYER_SECRET_KEY_JSON || '',
	solanaProgramId:
		process.env.SOLANA_PROGRAM_ID ||
		'8LvnKBjEobkQGsu3SkzCGTwrZaXzMZh1X4Wj5ZGcmqwW',
	trustlessWorkFeeWallet: process.env.TRUSTLESS_WORK_FEE_WALLET || '',
	port: process.env.PORT || 3000,
} as const
