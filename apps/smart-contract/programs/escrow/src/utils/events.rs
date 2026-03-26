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
