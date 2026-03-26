use anchor_lang::prelude::*;

use crate::{
    context::{
        InitializeMultiReleaseEscrow, FundMultiReleaseEscrow,
        ChangeMultiReleaseMilestoneStatus, ApproveMultiReleaseMilestone,
        ReleaseMilestoneFunds, DisputeMultiReleaseMilestone,
        ResolveMultiReleaseMilestoneDispute, WithdrawRemainingFunds,
    },
    errors::EscrowError,
    state::{MultiReleaseEscrowData, MAX_MILESTONES},
    utils::{
        fee_calculator::{FeeCalculator, FeeCalculatorTrait},
        token_transfer_handler::{transfer_from_escrow, transfer_to_escrow, has_sufficient_balance},
        math_basic::{BasicArithmetic, BasicMath},
        events::{
            MultiReleaseEscrowInitialized, MultiReleaseEscrowFunded,
            MilestoneFundsReleased, MilestoneDisputed,
            MilestoneDisputeResolved, RemainingFundsWithdrawn,
            MilestoneUpdated, MilestoneApproved,
        },
    },
};

const MAX_PLATFORM_FEE_BPS: i128 = 9900;

pub fn initialize_multi_release_escrow_handler(
    ctx: Context<InitializeMultiReleaseEscrow>,
    new_escrow: MultiReleaseEscrowData,
) -> Result<()> {
    if new_escrow.milestones.is_empty() {
        return Err(EscrowError::NoMileStoneDefined.into());
    }
    if new_escrow.milestones.len() > MAX_MILESTONES {
        return Err(EscrowError::TooManyMilestones.into());
    }
    if new_escrow.platform_fee > MAX_PLATFORM_FEE_BPS {
        return Err(EscrowError::PlatformFeeTooHigh.into());
    }
    for m in &new_escrow.milestones {
        if m.amount == 0 {
            return Err(EscrowError::MilestoneAmountCannotBeZero.into());
        }
    }

    let escrow = &mut ctx.accounts.escrow_account;
    **escrow = new_escrow;
    escrow.is_initialized = true;
    escrow.balance = 0;

    emit!(MultiReleaseEscrowInitialized {
        escrow_id: escrow.engagement_id.clone(),
        initializer: ctx.accounts.initializer.key(),
        milestones_count: escrow.milestones.len() as u32,
    });

    Ok(())
}

pub fn fund_multi_release_escrow_handler(
    ctx: Context<FundMultiReleaseEscrow>,
    amount: u64,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    let contract_balance = ctx.accounts.escrow_token_account.amount;
    let total_required = escrow.total_amount();

    if contract_balance >= total_required {
        return Err(EscrowError::EscrowFullyFunded.into());
    }

    let signer_balance = ctx.accounts.user_token_account.amount;
    if signer_balance < amount {
        return Err(EscrowError::SignerInsufficientFunds.into());
    }

    transfer_to_escrow(
        amount,
        ctx.accounts.user_token_account.to_account_info(),
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    )?;

    escrow.balance = contract_balance + amount;

    emit!(MultiReleaseEscrowFunded {
        escrow_id: escrow.engagement_id.clone(),
        funder: ctx.accounts.signer.key(),
        amount,
    });

    Ok(())
}

pub fn change_multi_release_milestone_status_handler(
    ctx: Context<ChangeMultiReleaseMilestoneStatus>,
    milestone_index: u32,
    new_status: String,
    new_evidence: Option<String>,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;

    let milestone = escrow.milestones.get_mut(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;

    if milestone.flags.released {
        return Err(EscrowError::MilestoneAlreadyReleased.into());
    }

    milestone.status = new_status.clone();
    if let Some(evidence) = new_evidence {
        milestone.evidence = evidence;
    }

    emit!(MilestoneUpdated {
        escrow_id: escrow.engagement_id.clone(),
        milestone_index,
        new_status,
    });

    Ok(())
}

pub fn approve_multi_release_milestone_handler(
    ctx: Context<ApproveMultiReleaseMilestone>,
    milestone_index: u32,
    approved: bool,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;

    let milestone = escrow.milestones.get_mut(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;

    if milestone.flags.released {
        return Err(EscrowError::MilestoneAlreadyReleased.into());
    }
    if milestone.flags.disputed {
        return Err(EscrowError::MilestoneIsDisputed.into());
    }

    milestone.flags.approved = approved;

    emit!(MilestoneApproved {
        escrow_id: escrow.engagement_id.clone(),
        milestone_index,
        approved,
    });

    Ok(())
}

pub fn release_milestone_funds_handler(
    ctx: Context<ReleaseMilestoneFunds>,
    milestone_index: u32,
) -> Result<()> {
    let escrow_account_info = ctx.accounts.escrow_account.to_account_info();
    let escrow = &mut ctx.accounts.escrow_account;

    let milestone = escrow.milestones.get(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;

    if !milestone.flags.approved {
        return Err(EscrowError::MilestoneNotApproved.into());
    }
    if milestone.flags.released {
        return Err(EscrowError::MilestoneAlreadyReleased.into());
    }
    if milestone.flags.disputed {
        return Err(EscrowError::MilestoneIsDisputed.into());
    }

    let milestone_amount = milestone.amount as i128;

    let fee_result = FeeCalculator::calculate_standard_fees(
        milestone_amount,
        escrow.platform_fee,
    )?;

    let total_required = (fee_result.trustless_work_fee
        + fee_result.platform_fee
        + fee_result.receiver_amount) as u64;

    has_sufficient_balance(&ctx.accounts.escrow_token_account, total_required)?;

    let bump = ctx.bumps.escrow_account;
    let engagement_id = escrow.engagement_id.clone();
    let binding = [bump];
    let authority_seeds: &[&[u8]] = &[b"multi_escrow", engagement_id.as_bytes(), &binding];

    transfer_from_escrow(
        fee_result.trustless_work_fee as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.trustless_work_account.to_account_info(),
        escrow_account_info.clone(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    transfer_from_escrow(
        fee_result.platform_fee as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.platform_account.to_account_info(),
        escrow_account_info.clone(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    transfer_from_escrow(
        fee_result.receiver_amount as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.receiver_account.to_account_info(),
        escrow_account_info.clone(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    // Mark as released
    let milestone_mut = escrow.milestones.get_mut(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;
    milestone_mut.flags.released = true;

    emit!(MilestoneFundsReleased {
        escrow_id: engagement_id,
        milestone_index,
        receiver: milestone_mut.receiver,
        receiver_amount: fee_result.receiver_amount,
    });

    Ok(())
}

pub fn dispute_multi_release_milestone_handler(
    ctx: Context<DisputeMultiReleaseMilestone>,
    milestone_index: u32,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    let signer = ctx.accounts.signer.key();

    // Verify signer is an authorized role
    let roles = &escrow.roles;
    let is_authorized = signer == roles.approver
        || signer == roles.service_provider
        || signer == roles.platform_address
        || signer == roles.release_signer
        || signer == roles.dispute_resolver;

    // Also check if signer is a milestone receiver
    let is_receiver = escrow.milestones.iter().any(|m| m.receiver == signer);

    if !is_authorized && !is_receiver {
        return Err(EscrowError::UnauthorizedToChangeDisputeFlag.into());
    }

    let milestone = escrow.milestones.get_mut(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;

    if milestone.flags.released {
        return Err(EscrowError::MilestoneAlreadyReleased.into());
    }
    if milestone.flags.disputed {
        return Err(EscrowError::MilestoneAlreadyDisputed.into());
    }

    milestone.flags.disputed = true;

    emit!(MilestoneDisputed {
        escrow_id: escrow.engagement_id.clone(),
        milestone_index,
        initiator: signer,
    });

    Ok(())
}

pub fn resolve_multi_release_milestone_dispute_handler(
    ctx: Context<ResolveMultiReleaseMilestoneDispute>,
    milestone_index: u32,
    approver_funds: i128,
    receiver_funds: i128,
) -> Result<()> {
    let escrow_account_info = ctx.accounts.escrow_account.to_account_info();
    let escrow = &mut ctx.accounts.escrow_account;

    let milestone = escrow.milestones.get(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;

    if !milestone.flags.disputed {
        return Err(EscrowError::MilestoneNotDisputed.into());
    }
    if milestone.flags.resolved {
        return Err(EscrowError::MilestoneAlreadyResolved.into());
    }
    if milestone.flags.released {
        return Err(EscrowError::MilestoneAlreadyReleased.into());
    }

    let total_funds = BasicMath::safe_add(approver_funds, receiver_funds)?;

    let fee_result = FeeCalculator::calculate_dispute_fees(
        approver_funds,
        receiver_funds,
        escrow.platform_fee,
        total_funds,
    )?;

    let total_required = (fee_result.trustless_work_fee
        + fee_result.platform_fee
        + fee_result.net_approver_funds
        + fee_result.net_provider_funds) as u64;

    has_sufficient_balance(&ctx.accounts.escrow_token_account, total_required)?;

    let bump = ctx.bumps.escrow_account;
    let engagement_id = escrow.engagement_id.clone();
    let binding = [bump];
    let authority_seeds: &[&[u8]] = &[b"multi_escrow", engagement_id.as_bytes(), &binding];

    transfer_from_escrow(
        fee_result.trustless_work_fee as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.trustless_work_account.to_account_info(),
        escrow_account_info.clone(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    transfer_from_escrow(
        fee_result.platform_fee as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.platform_account.to_account_info(),
        escrow_account_info.clone(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    if fee_result.net_approver_funds > 0 {
        transfer_from_escrow(
            fee_result.net_approver_funds as u64,
            ctx.accounts.escrow_token_account.to_account_info(),
            ctx.accounts.approver_account.to_account_info(),
            escrow_account_info.clone(),
            ctx.accounts.token_program.to_account_info(),
            authority_seeds,
        )?;
    }

    if fee_result.net_provider_funds > 0 {
        transfer_from_escrow(
            fee_result.net_provider_funds as u64,
            ctx.accounts.escrow_token_account.to_account_info(),
            ctx.accounts.receiver_account.to_account_info(),
            escrow_account_info.clone(),
            ctx.accounts.token_program.to_account_info(),
            authority_seeds,
        )?;
    }

    let milestone_mut = escrow.milestones.get_mut(milestone_index as usize)
        .ok_or(EscrowError::InvalidMileStoneIndex)?;
    milestone_mut.flags.resolved = true;
    milestone_mut.flags.disputed = false;

    emit!(MilestoneDisputeResolved {
        escrow_id: engagement_id,
        milestone_index,
        resolver: ctx.accounts.dispute_resolver.key(),
        approver_funds,
        receiver_funds,
    });

    Ok(())
}

pub fn withdraw_remaining_funds_handler(
    ctx: Context<WithdrawRemainingFunds>,
) -> Result<()> {
    let escrow_account_info = ctx.accounts.escrow_account.to_account_info();
    let escrow = &ctx.accounts.escrow_account;

    // All milestones must be settled (released or resolved)
    for m in &escrow.milestones {
        if !m.flags.released && !m.flags.resolved {
            return Err(EscrowError::NotAllMilestonesSettled.into());
        }
    }

    let remaining = ctx.accounts.escrow_token_account.amount;
    if remaining == 0 {
        return Err(EscrowError::NoRemainingFunds.into());
    }

    let bump = ctx.bumps.escrow_account;
    let engagement_id = escrow.engagement_id.clone();
    let binding = [bump];
    let authority_seeds: &[&[u8]] = &[b"multi_escrow", engagement_id.as_bytes(), &binding];

    transfer_from_escrow(
        remaining,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.approver_token_account.to_account_info(),
        escrow_account_info,
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    emit!(RemainingFundsWithdrawn {
        escrow_id: engagement_id,
        approver: ctx.accounts.approver.key(),
        amount: remaining,
    });

    Ok(())
}
