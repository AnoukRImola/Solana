import * as borsh from '@project-serum/borsh'

export const milestoneSchemaBorsh = borsh.struct([
	borsh.bool('approved_flag'),
	borsh.str('description'),
	borsh.str('evidence'),
	borsh.str('status'),
])

export const swapDataSchemaBorsh = borsh.struct([
	borsh.u128('original_amount'),
	borsh.str('original_currency'),
	borsh.u128('token_amount'),
	borsh.str('token_currency'),
	borsh.str('conversion_tx_hash'),
	borsh.u128('conversion_rate'),
	borsh.i64('conversion_timestamp'),
])

// THIS SCHEMA MUST EXACTLY MATCH YOUR SOLANA PROGRAM'S ESCROW STATE STRUCT
// TODO: Double check the schema with the program w/Team. -Andler.
export const ESCROW_ACCOUNT_STATE_SCHEMA = borsh.struct([
	borsh.str('title'),
	borsh.str('description'),
	borsh.str('engagement_id'),
	borsh.publicKey('receiver'),
	borsh.publicKey('approver'),
	borsh.publicKey('trustline'), // Mint address of the token
	borsh.publicKey('release_signer'),
	borsh.publicKey('service_provider'),
	borsh.publicKey('dispute_resolver'),
	borsh.publicKey('platform_address'),
	borsh.u64('amount'),
	borsh.u32('platform_fee'),
	borsh.u32('receiver_memo'),
	borsh.u8('trustline_decimals'),
	borsh.bool('dispute_flag'),
	borsh.bool('release_flag'),
	borsh.bool('resolved_flag'),
	borsh.vec(milestoneSchemaBorsh, 'milestones'),
	borsh.option(swapDataSchemaBorsh, 'swap_data'),
])
