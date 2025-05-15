import { PublicKey } from '@solana/web3.js'
import type { Milestone } from './milestone.interface'

export interface Escrow {
	title: string
	description: string
	engagementId: string
	receiver: string
	trustline: string
	approver: string
	releaseSigner: string
	serviceProvider: string
	disputeResolver: string
	platformAddress: string
	amount: number
	platformFee: number
	receiverMemo: number
	trustlineDecimals: number
	disputeFlag: boolean
	releaseFlag: boolean
	resolvedFlag: boolean
	milestones: Milestone[]
	swapData?: EscrowSwapData
	contractId?: string
}

export interface EscrowSwapData {
	originalAmount: string
	originalCurrency: string
	tokenAmount: string
	tokenCurrency: string
	conversionTxHash: string
	conversionRate: string
	conversionTimestamp: number
}

export interface EscrowStructure {
	title: string
	amount: string
	description: string
	engagementId: string
	receiver: PublicKey
	approver: PublicKey
	trustline: PublicKey
	releaseSigner: PublicKey
	serviceProvider: PublicKey
	disputeResolver: PublicKey
	platformAddress: PublicKey
	platformFee: number
	receiverMemo: number
	trustlineDecimals: number
	milestones: Milestone[]
	contractId?: string
	disputeFlag?: boolean
	releaseFlag?: boolean
	resolvedFlag?: boolean
	swapData?: EscrowSwapData
}

// define SmartContractEscrow interface (same as EscrowStructure but kebab_case)
export interface SmartContractEscrowStructure {
	title: string
	amount: string
	description: string
	engagement_id: string
	receiver: PublicKey
	approver: PublicKey
	trustline: PublicKey
	release_signer: PublicKey
	service_provider: PublicKey
	dispute_resolver: PublicKey
	platform_address: PublicKey
	platform_fee: number
	receiver_memo: number
	trustline_decimals: number
	milestones: Milestone[]
	contract_id?: string
	dispute_flag?: boolean
	release_flag?: boolean
	resolved_flag?: boolean
	swap_data?: SmartContractEscrowSwapData
}

export interface SmartContractEscrowSwapData {
	original_amount: string
	original_currency: string
	token_amount: string
	token_currency: string
	conversion_tx_hash: string
	conversion_rate: string
	conversion_timestamp: number
}
