use anchor_lang::prelude::Pubkey;

use crate::{
    errors::EscrowError,
    state::EscrowData,
};

pub fn validate_milestone_status_change_conditions(
    escrow: &EscrowData,
    milestone_index: u32,
    service_provider: &Pubkey,
) -> Result<(), EscrowError> {
    if service_provider != &escrow.roles.service_provider {
        return Err(EscrowError::OnlyServiceProviderChangeMilstoneStatus);
    }

    if escrow.milestones.is_empty() {
        return Err(EscrowError::NoMileStoneDefined);
    }

    if milestone_index as usize >= escrow.milestones.len() {
        return Err(EscrowError::InvalidMileStoneIndex);
    }

    Ok(())
}

pub fn validate_milestone_flag_change_conditions(
    escrow: &EscrowData,
    milestone_index: u32,
    approver: &Pubkey,
) -> Result<(), EscrowError> {
    if approver != &escrow.roles.approver {
        return Err(EscrowError::OnlyApproverChangeMilstoneFlag);
    }

    if escrow.milestones.is_empty() {
        return Err(EscrowError::NoMileStoneDefined);
    }

    if milestone_index as usize >= escrow.milestones.len() {
        return Err(EscrowError::InvalidMileStoneIndex);
    }

    Ok(())
}
