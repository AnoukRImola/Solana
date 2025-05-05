use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount, Transfer, transfer};

use crate::{
    state::types::EscrowData,
    utils::{
        fee::calculator::{FeeCalculator, FeeCalculatorTrait},
        math::basic::{BasicMath, BasicArithmetic},
        validators::dispute::{
            validate_dispute_resolution_conditions, validate_dispute_flag_change_conditions,
        },
        events::emit_escrow_event,
    },
};

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub dispute_resolver: Signer<'info>,

    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,

    pub escrow_authority: AccountInfo<'info>,

    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub trustless_work_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub platform_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub approver_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub service_provider_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

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

    validate_dispute_resolution_conditions(
        escrow,
        &escrow.roles.dispute_resolver,
        approver_funds,
        service_provider_funds,
        &fee_result,
    )?;

    let authority_seeds = &[b"escrow", escrow.engagement_id.as_bytes(), &[bump]];

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.trustless_work_account.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            },
            &[authority_seeds],
        ),
        fee_result.trustless_work_fee as u64,
    )?;

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.platform_account.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            },
            &[authority_seeds],
        ),
        fee_result.platform_fee as u64,
    )?;

    if fee_result.net_approver_funds > 0 {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.approver_account.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
                &[authority_seeds],
            ),
            fee_result.net_approver_funds as u64,
        )?;
    }

    if fee_result.net_provider_funds > 0 {
        transfer(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                Transfer {
                    from: ctx.accounts.escrow_token_account.to_account_info(),
                    to: ctx.accounts.service_provider_account.to_account_info(),
                    authority: ctx.accounts.escrow_authority.to_account_info(),
                },
                &[authority_seeds],
            ),
            fee_result.net_provider_funds as u64,
        )?;
    }

    escrow.flags.resolved = true;
    escrow.flags.dispute = false;

    // emit_escrow_event(escrow.engagement_id.clone(), escrow.clone());

    Ok(())
}

#[derive(Accounts)]
pub struct ChangeDisputeFlag<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
}

pub fn change_dispute_flag_handler(ctx: Context<ChangeDisputeFlag>) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    validate_dispute_flag_change_conditions(escrow, &ctx.accounts.signer.key())?;
    escrow.flags.dispute = true;
    // emit_escrow_event(escrow.engagement_id.clone(), escrow.clone());
    Ok(())
}