use anchor_lang::prelude::*;

/// Maximum lengths for string fields
pub const MAX_ENGAGEMENT_ID_LEN: usize = 64;
pub const MAX_TITLE_LEN: usize = 64;
pub const MAX_DESCRIPTION_LEN: usize = 256;
pub const MAX_MILESTONE_DESCRIPTION_LEN: usize = 128;
pub const MAX_MILESTONE_STATUS_LEN: usize = 32;
pub const MAX_MILESTONE_EVIDENCE_LEN: usize = 256;
pub const MAX_MILESTONES: usize = 50;

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Milestone {
    pub description: String,
    pub status: String,
    pub evidence: String,
    pub approved_flag: bool,
}

impl Milestone {
    pub const MAX_SIZE: usize = 4 + MAX_MILESTONE_DESCRIPTION_LEN
        + 4 + MAX_MILESTONE_STATUS_LEN
        + 4 + MAX_MILESTONE_EVIDENCE_LEN
        + 1;
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

impl Roles {
    pub const SIZE: usize = 6 * 32;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Flags {
    pub dispute: bool,
    pub release: bool,
    pub resolved: bool,
}

impl Flags {
    pub const SIZE: usize = 3;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct Trustline {
    pub address: Pubkey,
    pub decimals: u8,
}

impl Trustline {
    pub const SIZE: usize = 32 + 1;
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
    pub balance: u64,
    pub is_initialized: bool,
}

impl EscrowData {
    /// Calculate account space based on milestone count.
    /// Uses max string lengths to ensure room for future updates.
    pub fn space(milestones_count: usize) -> usize {
        8 // discriminator
        + 4 + MAX_ENGAGEMENT_ID_LEN
        + 4 + MAX_TITLE_LEN
        + 4 + MAX_DESCRIPTION_LEN
        + 16 // amount (i128)
        + 16 // platform_fee (i128)
        + 4 + milestones_count * Milestone::MAX_SIZE
        + Flags::SIZE
        + Trustline::SIZE
        + 16 // receiver_memo (i128)
        + Roles::SIZE
        + 8  // balance (u64)
        + 1  // is_initialized (bool)
    }
}

// ============================
// Multi-Release Escrow State
// ============================

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct MilestoneFlags {
    pub approved: bool,
    pub disputed: bool,
    pub released: bool,
    pub resolved: bool,
}

impl MilestoneFlags {
    pub const SIZE: usize = 4;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct MultiReleaseMilestone {
    pub description: String,
    pub status: String,
    pub evidence: String,
    pub amount: u64,
    pub receiver: Pubkey,
    pub flags: MilestoneFlags,
}

impl MultiReleaseMilestone {
    pub const MAX_SIZE: usize = 4 + MAX_MILESTONE_DESCRIPTION_LEN
        + 4 + MAX_MILESTONE_STATUS_LEN
        + 4 + MAX_MILESTONE_EVIDENCE_LEN
        + 8  // amount (u64)
        + 32 // receiver (Pubkey)
        + MilestoneFlags::SIZE;
}

/// Roles for multi-release escrow — no global receiver since each milestone has its own.
#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq)]
pub struct MultiReleaseRoles {
    pub approver: Pubkey,
    pub service_provider: Pubkey,
    pub platform_address: Pubkey,
    pub release_signer: Pubkey,
    pub dispute_resolver: Pubkey,
}

impl MultiReleaseRoles {
    pub const SIZE: usize = 5 * 32;
}

#[account]
#[derive(Debug)]
pub struct MultiReleaseEscrowData {
    pub engagement_id: String,
    pub title: String,
    pub description: String,
    pub platform_fee: i128,
    pub milestones: Vec<MultiReleaseMilestone>,
    pub trustline: Trustline,
    pub roles: MultiReleaseRoles,
    pub balance: u64,
    pub is_initialized: bool,
}

impl MultiReleaseEscrowData {
    pub fn space(milestones_count: usize) -> usize {
        8 // discriminator
        + 4 + MAX_ENGAGEMENT_ID_LEN
        + 4 + MAX_TITLE_LEN
        + 4 + MAX_DESCRIPTION_LEN
        + 16 // platform_fee (i128)
        + 4 + milestones_count * MultiReleaseMilestone::MAX_SIZE
        + Trustline::SIZE
        + MultiReleaseRoles::SIZE
        + 8  // balance (u64)
        + 1  // is_initialized (bool)
    }

    /// Sum of all milestone amounts.
    pub fn total_amount(&self) -> u64 {
        self.milestones.iter().map(|m| m.amount).sum()
    }
}
