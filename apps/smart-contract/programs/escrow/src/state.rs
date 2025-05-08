use anchor_lang::prelude::*;

/// Escrow State
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Milestone {
    pub description: String,
    pub status: String,
    pub evidence: String,
    pub approved_flag: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Roles {
    pub approver: Pubkey,
    pub service_provider: Pubkey,
    pub platform_address: Pubkey,
    pub release_signer: Pubkey,
    pub dispute_resolver: Pubkey,
    pub receiver: Pubkey,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Flags {
    pub dispute: bool,
    pub release: bool,
    pub resolved: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Trustline {
    pub address: Pubkey,
    pub decimals: i128,
}

#[account]
#[derive(Debug)]
pub struct EscrowData {
    pub engagement_id: String,
    pub title: String,
    pub description: String,
    pub amount: i128,
    pub platform_fee: i128,
    pub milestones: Vec<Milestone>,
    pub flags: Flags,
    pub trustline: Trustline,
    pub receiver_memo: i128,
    pub roles: Roles,
}

/// Token State
#[account]
pub struct TokenAdmin {
    pub admin: Pubkey,
}

#[derive(Clone, Debug, PartialEq)]
pub struct AddressBalance {
    pub address: Pubkey,
    pub balance: i128,
    pub trustline_decimals: i128,
}

#[derive(Clone, Debug, PartialEq)]
pub struct AllowanceValue {
    pub amount: i128,
    pub expiration_slot: u32,
}

#[account]
pub struct Allowance {
    pub from: Pubkey,
    pub spender: Pubkey,
    pub amount: i128,
    pub expiration_slot: u64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct TokenMetadata {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

#[account]
#[derive(Debug)]
pub struct MetadataAccount {
    pub name: String,
    pub symbol: String,
    pub decimals: u8,
}

// #[derive(Clone, Debug, PartialEq)]
// pub enum DataKey {
//     Escrow,
//     Balance(Pubkey),
//     Allowance(AllowanceKey),
//     Admin,
// }