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
	type RawSorobanTransaction,
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
	[ChainSymbol.SRB]: 'https://rpc.ankr.com/stellar_soroban',
	[ChainSymbol.STLR]: 'https://horizon.stellar.org',
}
const ESCROW_USDC_ADDRESSES = {
	[ChainSymbol.SOL]: 'GDW2...', // Replace with actual USDC address
	[ChainSymbol.TRX]: 'GDW2...', // Replace with actual USDC address
	[ChainSymbol.SRB]: 'GDW2...', // Replace with actual USDC address
	[ChainSymbol.STLR]: 'GDW2...', // Replace with actual USDC address
}

export class AllbridgeService {
	private readonly sdk: AllbridgeCoreSdk
	private readonly solanaConnection: Connection
	private readonly solanaConfig: SolanaConfig

	constructor() {
		// We may want to move these to config/env
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

	getRawTransactionForStellar = async (
		params: SendParams,
	): Promise<RawSorobanTransaction> => {
		return (await this.sdk.bridge.rawTxBuilder.send(
			params,
		)) as RawSorobanTransaction
	}

	// Swap any supported token to USDC on Solana
	async swapToUSDC({
		fromToken,
		amount,
		userAddress,
		walletType,
	}: {
		fromToken: string
		amount: string
		userAddress: string
		walletType:
			| ChainSymbol.SOL
			| ChainSymbol.TRX
			| ChainSymbol.SRB
			| ChainSymbol.STLR
	}): Promise<{
		txHash: string
	}> {
		// 1. Find token info for fromToken and USDC
		const tokens = await this.sdk.tokens('swap')
		const sourceToken = tokens.find((t) => t.symbol === fromToken)
		const usdcToken = tokens.find((t) => t.symbol === 'USDC')

		if (!sourceToken || !usdcToken) {
			throw new Error('Token not supported on Solana')
		}
		// 2. Check bridge allowance
		const allowance = await this.sdk.bridge.checkAllowance({
			amount: amount,
			token: sourceToken,
			owner: userAddress,
		})

		if (!allowance) {
			throw new Error('No allowance available for this swap')
		}
		// 3. Prepare and send swap transaction
		const sendParams: SendParams = {
			amount,
			fromAccountAddress: userAddress,
			toAccountAddress: ESCROW_USDC_ADDRESSES[walletType], // Escrow system will receive USDC
			sourceToken,
			destinationToken: usdcToken,
			messenger: Messenger.ALLBRIDGE,
		}

		let tx:
			| RawBridgeSolanaTransaction
			| RawEvmTransaction
			| RawSorobanTransaction
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
			case 'stellar': {
				tx = await this.getRawTransactionForStellar(sendParams)
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

	// Swap USDC back to original token
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
		// 1. Find token info for fromToken and USDC
		const tokens = await this.sdk.tokens('swap')
		const sourceToken = tokens.find((t) => t.symbol === 'USDC')
		const destinationToken = tokens.find((t) => t.symbol === toToken)

		if (!sourceToken || !destinationToken) {
			throw new Error('Token not supported on Solana')
		}
		// 2. Check bridge allowance
		const allowance = await this.sdk.bridge.checkAllowance({
			amount: amount,
			token: sourceToken,
			owner: userAddress,
		})

		if (!allowance) {
			throw new Error('No allowance available for this swap')
		}
		// 3. Prepare and send swap transaction
		const sendParams: SendParams = {
			amount,
			fromAccountAddress: ESCROW_USDC_ADDRESS, // Escrow system will receive USDC
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
