import {
	AllbridgeCoreSdk,
	type ChainDetailsWithTokens,
	ChainSymbol,
	ChainType,
	type GasFeeOptions,
	Messenger,
	type NodeRpcUrls,
	type RawBridgeSolanaTransaction,
	type RawEvmTransaction,
	type RawTronTransaction,
	type SendParams,
	type TokenWithChainDetails,
} from '@allbridge/bridge-core-sdk'
import { Connection, Keypair } from '@solana/web3.js'
import type { TronWeb } from 'tronweb'
import { Web3 } from 'web3'
import type { SolanaConfig } from './types'

const SDK_NODE_URLS: NodeRpcUrls = {
	[ChainSymbol.SOL]: 'https://api.mainnet-beta.solana.com',
	[ChainSymbol.TRX]: 'https://tron-rpc.publicnode.com',
}
const ESCROW_USDC_ADDRESSES = {
	[ChainSymbol.SOL]: 'GDW2...', // Replace with actual USDC address
	[ChainSymbol.TRX]: 'GDW2...', // Replace with actual USDC address
}

class AllbridgeService {
	private readonly sdk: AllbridgeCoreSdk
	private readonly solanaConnection: Connection
	private readonly solanaConfig: SolanaConfig

	constructor() {
		this.solanaConnection = new Connection(
			SDK_NODE_URLS[ChainSymbol.SOL],
			'confirmed',
		)
		this.sdk = new AllbridgeCoreSdk(SDK_NODE_URLS)
		this.solanaConfig = {
			connection: this.solanaConnection,
			payer: Keypair.fromSecretKey(
				Uint8Array.from(
					JSON.parse(process.env.SOLANA_PAYER_SECRET_KEY_JSON || '[]'),
				),
			),
		}
	}

	getChains = async (): Promise<ChainDetailsWithTokens[]> => {
		return Object.values(await this.sdk.chainDetailsMap())
	}

	getGasFeeOptions = async (
		sourceToken: TokenWithChainDetails,
		destinationToken: TokenWithChainDetails,
	): Promise<GasFeeOptions> => {
		return this.sdk.getGasFeeOptions(
			sourceToken,
			destinationToken,
			Messenger.ALLBRIDGE,
		)
	}

	getRawTransactionForEvm = async (
		params: SendParams,
		web3: Web3,
	): Promise<RawEvmTransaction> => {
		return (await this.sdk.bridge.rawTxBuilder.send(
			params,
			web3,
		)) as RawEvmTransaction
	}

	getRawTransactionForTron = async (
		params: SendParams,
		tronWeb: TronWeb,
	): Promise<RawTronTransaction> => {
		return (await this.sdk.bridge.rawTxBuilder.send(
			params,
			tronWeb,
		)) as RawTronTransaction
	}

	getRawTransactionForSolana = async (
		params: SendParams,
	): Promise<RawBridgeSolanaTransaction> => {
		return (await this.sdk.bridge.rawTxBuilder.send(
			params,
		)) as RawBridgeSolanaTransaction
	}

	async swapToUSDC({
		fromToken,
		amount,
		userAddress,
		walletType,
	}: {
		fromToken: string
		amount: string
		userAddress: string
		walletType: 'evm' | 'solana' | 'tron'
	}): Promise<{
		txHash: string
	}> {
		const tokens = await this.sdk.tokens('swap')
		const sourceToken = tokens.find((t) => t.symbol === fromToken)
		const usdcToken = tokens.find((t) => t.symbol === 'USDC')

		if (!sourceToken || !usdcToken) {
			throw new Error('Token not supported on Solana')
		}

		const allowance = await this.sdk.bridge.checkAllowance({
			amount: amount,
			token: sourceToken,
			owner: userAddress,
		})

		if (!allowance) {
			throw new Error('No allowance available for this swap')
		}

		const sendParams: SendParams = {
			amount,
			fromAccountAddress: userAddress,
			toAccountAddress: ESCROW_USDC_ADDRESSES[walletType],
			sourceToken,
			destinationToken: usdcToken,
			messenger: Messenger.ALLBRIDGE,
		}

		let tx:
			| RawBridgeSolanaTransaction
			| RawEvmTransaction
			| RawTronTransaction = null

		switch (walletType) {
			case 'evm': {
				const web3 = new Web3(
					new Web3.providers.HttpProvider(
						this.sdk.chainDetailsMap[ChainType.EVM].rpcUrl,
					),
				)
				tx = await this.getRawTransactionForEvm(sendParams, web3)
				break
			}
			case 'solana':
				tx = await this.getRawTransactionForSolana(sendParams)
				break
			default:
				throw new Error('Unsupported wallet type')
		}

		if (!tx) {
			throw new Error('Failed to create transaction')
		}

		return {
			txHash: tx.toString(),
		}
	}

	async swapFromUSDC({
		toToken,
		amount,
		userAddress,
	}: {
		toToken: string
		amount: string
		userAddress: string
	}): Promise<{
		txHash: string
	}> {
		const tokens = await this.sdk.tokens('swap')
		const sourceToken = tokens.find((t) => t.symbol === 'USDC')
		const destinationToken = tokens.find((t) => t.symbol === toToken)

		if (!sourceToken || !destinationToken) {
			throw new Error('Token not supported on Solana')
		}

		const allowance = await this.sdk.bridge.checkAllowance({
			amount: amount,
			token: sourceToken,
			owner: userAddress,
		})

		if (!allowance) {
			throw new Error('No allowance available for this swap')
		}

		const sendParams: SendParams = {
			amount,
			fromAccountAddress: ESCROW_USDC_ADDRESSES[ChainSymbol.SOL],
			toAccountAddress: userAddress,
			sourceToken,
			destinationToken,
			messenger: Messenger.ALLBRIDGE,
		}

		const web3 = new Web3(
			new Web3.providers.HttpProvider(
				this.sdk.chainDetailsMap[ChainType.EVM].rpcUrl,
			),
		)
		const tx = await this.getRawTransactionForEvm(sendParams, web3)

		if (!tx) {
			throw new Error('Failed to create transaction')
		}

		return {
			txHash: tx.toString(),
		}
	}
}

export { AllbridgeService, ESCROW_USDC_ADDRESSES, SDK_NODE_URLS }
