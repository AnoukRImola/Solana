use anchor_lang::prelude::*;

#[event]
pub struct EscrowInitialized {
    pub escrow_id: String,
    pub initializer: Pubkey,
}

#[event]
pub struct EscrowFunded {
    pub escrow_id: String,
    pub funder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct FundsReleased {
    pub escrow_id: String,
    pub release_signer: Pubkey,
    pub receiver_amount: i128,
}

#[event]
pub struct DisputeStarted {
    pub escrow_id: String,
    pub initiator: Pubkey,
}

#[event]
pub struct DisputeResolved {
    pub escrow_id: String,
    pub resolver: Pubkey,
    pub approver_funds: i128,
    pub provider_funds: i128,
}

#[event]
pub struct MilestoneUpdated {
    pub escrow_id: String,
    pub milestone_index: u32,
    pub new_status: String,
}

#[event]
pub struct MilestoneApproved {
    pub escrow_id: String,
    pub milestone_index: u32,
    pub approved: bool,
}

#[event]
pub struct EscrowPropertiesChanged {
    pub escrow_id: String,
    pub platform_address: Pubkey,
}

// Multi-Release Events

#[event]
pub struct MultiReleaseEscrowInitialized {
    pub escrow_id: String,
    pub initializer: Pubkey,
    pub milestones_count: u32,
}

#[event]
pub struct MultiReleaseEscrowFunded {
    pub escrow_id: String,
    pub funder: Pubkey,
    pub amount: u64,
}

#[event]
pub struct MilestoneFundsReleased {
    pub escrow_id: String,
    pub milestone_index: u32,
    pub receiver: Pubkey,
    pub receiver_amount: i128,
}

#[event]
pub struct MilestoneDisputed {
    pub escrow_id: String,
    pub milestone_index: u32,
    pub initiator: Pubkey,
}

#[event]
pub struct MilestoneDisputeResolved {
    pub escrow_id: String,
    pub milestone_index: u32,
    pub resolver: Pubkey,
    pub approver_funds: i128,
    pub receiver_funds: i128,
}

#[event]
pub struct RemainingFundsWithdrawn {
    pub escrow_id: String,
    pub approver: Pubkey,
    pub amount: u64,
}

// Compliance Events

#[event]
pub struct ComplianceRegistryInitialized {
    pub authority: Pubkey,
    pub travel_rule_threshold: u64,
}

#[event]
pub struct AddressKycVerified {
    pub address: Pubkey,
    pub kyc_provider: String,
    pub jurisdiction: String,
    pub risk_score: u8,
}

#[event]
pub struct AddressKycRevoked {
    pub address: Pubkey,
}

#[event]
pub struct EscrowComplianceSet {
    pub escrow_address: Pubkey,
    pub requires_kyc: bool,
}

#[event]
pub struct TravelRuleDataSet {
    pub escrow_address: Pubkey,
}
