use crate::{
    errors::EscrowError,
    state::{EscrowData, Roles}, 
    utils::fee_calculator::DisputeFeeResult,
};
use anchor_lang::prelude::*;

pub fn validate_dispute_resolution_conditions(
    escrow: &EscrowData,
    dispute_resolver: &Pubkey,
    approver_funds: i128,
    provider_funds: i128,
    fee_result: &DisputeFeeResult,
) -> Result<()> {
    if dispute_resolver != &escrow.roles.dispute_resolver {
        return Err(EscrowError::OnlyDisputeResolverCanExecuteThisFunction.into());
    }

    if !escrow.flags.dispute {
        return Err(EscrowError::EscrowNotInDispute.into());
    }

    if approver_funds < fee_result.net_approver_funds {
        return Err(EscrowError::InsufficientApproverFundsForCommissions.into());
    }

    if provider_funds < fee_result.net_provider_funds {
        return Err(EscrowError::InsufficientServiceProviderFundsForCommissions.into());
    }

    Ok(())
}

pub fn validate_dispute_flag_change_conditions(
    escrow: &EscrowData,
    signer: &Pubkey,
) -> Result<()> {
    if escrow.flags.dispute {
        return Err(EscrowError::EscrowAlreadyInDispute.into());
    }

    let Roles {
        approver,
        service_provider,
        platform_address,
        release_signer,
        dispute_resolver,
        receiver,
    } = &escrow.roles;

    let is_authorized = signer == approver
        || signer == service_provider
        || signer == platform_address
        || signer == release_signer
        || signer == dispute_resolver
        || signer == receiver;

    if !is_authorized {
        return Err(EscrowError::UnauthorizedToChangeDisputeFlag.into());
    }

    Ok(())
}