use anchor_lang::prelude::*;

use crate::{
    context::{ChangeDisputeFlag, ResolveDispute},
    utils::{
        fee::calculator::{FeeCalculator, FeeCalculatorTrait},
        token::transfer_handler::{transfer_from_escrow, has_sufficient_balance},
        math::basic::{BasicArithmetic, BasicMath},
        validators::dispute::{
            validate_dispute_flag_change_conditions, validate_dispute_resolution_conditions
        },
        // events::emit_escrow_event,
    },
};

pub fn resolve_dispute_handler(
    ctx: Context<ResolveDispute>,
    approver_funds: i128,
    service_provider_funds: i128,
    bump: u8,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;

    let total_funds = BasicMath::safe_add(approver_funds, service_provider_funds)?;

    let fee_result = FeeCalculator::calculate_dispute_fees(
        approver_funds,
        service_provider_funds,
        escrow.platform_fee,
        total_funds,
    )?;

    let total_required = (fee_result.trustless_work_fee
        + fee_result.platform_fee
        + fee_result.net_approver_funds
        + fee_result.net_provider_funds) as u64;

    has_sufficient_balance(&ctx.accounts.escrow_token_account, total_required)?;

    validate_dispute_resolution_conditions(
        escrow,
        &escrow.roles.dispute_resolver,
        approver_funds,
        service_provider_funds,
        &fee_result,
    )?;

    let authority_seeds = &[b"escrow", escrow.engagement_id.as_bytes(), &[bump]];

    transfer_from_escrow(
        fee_result.trustless_work_fee as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.trustless_work_account.to_account_info(),
        ctx.accounts.escrow_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    transfer_from_escrow(
        fee_result.platform_fee as u64,
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.platform_account.to_account_info(),
        ctx.accounts.escrow_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    if fee_result.net_approver_funds > 0 {
        transfer_from_escrow(
            fee_result.net_approver_funds as u64,
            ctx.accounts.escrow_token_account.to_account_info(),
            ctx.accounts.approver_account.to_account_info(),
            ctx.accounts.escrow_authority.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            authority_seeds,
        )?;
    }

    if fee_result.net_provider_funds > 0 {
        transfer_from_escrow(
            fee_result.net_provider_funds as u64,
            ctx.accounts.escrow_token_account.to_account_info(),
            ctx.accounts.service_provider_account.to_account_info(),
            ctx.accounts.escrow_authority.to_account_info(),
            ctx.accounts.token_program.to_account_info(),
            authority_seeds,
        )?;
    }

    escrow.flags.resolved = true;
    escrow.flags.dispute = false;

    // emit_escrow_event(escrow.engagement_id.clone(), escrow.clone());

    Ok(())
}

pub fn change_dispute_flag_handler(ctx: Context<ChangeDisputeFlag>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    validate_dispute_flag_change_conditions(escrow, &ctx.accounts.signer.key())?;
    escrow.flags.dispute = true;
    // emit_escrow_event(escrow.engagement_id.clone(), escrow.clone());
    Ok(())
}