use anchor_lang::prelude::*;

use crate::{
    errors::EscrowError,
    state::{EscrowData, Milestone, MAX_MILESTONES},
};

const MAX_PLATFORM_FEE_BPS: i128 = 9900; // 99%

pub fn validate_funding_conditions(
    escrow: &EscrowData,
    signer_balance: i128,
    contract_balance: i128,
    amount_to_deposit: i128,
) -> Result<()> {
    if escrow.flags.dispute {
        return Err(EscrowError::EscrowOpenedForDisputeResolution.into());
    }

    if contract_balance >= escrow.amount {
        return Err(EscrowError::EscrowFullyFunded.into());
    }

    if signer_balance < amount_to_deposit {
        return Err(EscrowError::SignerInsufficientFunds.into());
    }

    Ok(())
}

pub fn validate_release_conditions(escrow: &EscrowData, release_signer: &Pubkey) -> Result<()> {
    if escrow.flags.release {
        return Err(EscrowError::EscrowAlreadyResolved.into());
    }

    if release_signer != &escrow.roles.release_signer {
        return Err(EscrowError::OnlyReleaseSignerCanDistributeEarnings.into());
    }

    if escrow.milestones.is_empty() {
        return Err(EscrowError::NoMileStoneDefined.into());
    }

    if !escrow.milestones.iter().all(|m| m.approved_flag) {
        return Err(EscrowError::EscrowNotCompleted.into());
    }

    if escrow.flags.dispute {
        return Err(EscrowError::EscrowOpenedForDisputeResolution.into());
    }

    Ok(())
}

pub fn validate_escrow_property_change_conditions(
    escrow: &EscrowData,
    platform_address: &Pubkey,
    contract_balance: i128,
    milestones: &[Milestone],
) -> Result<()> {
    if platform_address != &escrow.roles.platform_address {
        return Err(EscrowError::OnlyPlatformAddressExecuteThisFunction.into());
    }

    if (!milestones.is_empty() && milestones.iter().any(|m| m.approved_flag))
        || escrow.milestones.iter().any(|m| m.approved_flag)
    {
        return Err(EscrowError::MilestoneApprovedCantChangeEscrowProperties.into());
    }

    if contract_balance > 0 {
        return Err(EscrowError::EscrowHasFunds.into());
    }

    if escrow.flags.dispute {
        return Err(EscrowError::EscrowOpenedForDisputeResolution.into());
    }

    Ok(())
}

pub fn validate_initialize_escrow_conditions(
    escrow_data: &EscrowData,
) -> std::result::Result<(), EscrowError> {
    if escrow_data.amount == 0 {
        return Err(EscrowError::AmountCannotBeZero);
    }

    if escrow_data.milestones.len() > MAX_MILESTONES {
        return Err(EscrowError::TooManyMilestones);
    }

    if escrow_data.platform_fee > MAX_PLATFORM_FEE_BPS {
        return Err(EscrowError::PlatformFeeTooHigh);
    }

    Ok(())
}
