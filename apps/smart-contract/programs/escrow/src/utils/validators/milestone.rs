use anchor_lang::prelude::Pubkey;

use crate::{
    errors::EscrowError,
    state::EscrowData,
};

pub fn validate_milestone_status_change_conditions(
    escrow: &EscrowData,
    milestone_index: usize,
    service_provider: &Pubkey,
) -> Result<(), EscrowError> {
    if service_provider != &escrow.roles.service_provider {
        return Err(EscrowError::OnlyServiceProviderChangeMilstoneStatus.into());
    }

    if escrow.milestones.is_empty() {
        return Err(EscrowError::NoMileStoneDefined.into());
    }

    if milestone_index >= escrow.milestones.len() {
        return Err(EscrowError::InvalidMileStoneIndex.into());
    }

    Ok(())
}

pub fn validate_milestone_flag_change_conditions(
    escrow: &EscrowData,
    milestone_index: usize,
    approver: &Pubkey,
) -> Result<(), EscrowError> {
    if approver != &escrow.roles.approver {
        return Err(EscrowError::OnlyApproverChangeMilstoneFlag.into());
    }

    if escrow.milestones.is_empty() {
        return Err(EscrowError::NoMileStoneDefined.into());
    }

    if milestone_index >= escrow.milestones.len() {
        return Err(EscrowError::InvalidMileStoneIndex.into());
    }

    Ok(())
}
