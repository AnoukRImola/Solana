use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Token, TokenAccount, Transfer};

use crate::{
    error::EscrowError,
    state::types::{AddressBalance, EscrowData},
    utils::{
        fee::calculator::{FeeCalculator, FeeCalculatorTrait, StandardFeeResult},
        validators::escrow::{
            validate_escrow_property_change_conditions, validate_funding_conditions, validate_release_conditions
        },
        // events::emit_escrow_event,
    },
};

#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
}
pub fn initialize_escrow_handler(ctx: Context<InitializeEscrow>, new_escrow: EscrowData) -> std::result::Result<EscrowData, EscrowError> {
    let escrow = &mut ctx.accounts.escrow_account;

    if new_escrow.amount == 0 {
        return Err(EscrowError::AmountCannotBeZero);
    }

    if new_escrow.milestones.len() > 10 {
        return Err(EscrowError::TooManyMilestones);
    }

    **escrow = new_escrow.clone();

    Ok(new_escrow)
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub release_signer: Signer<'info>,
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
    pub receiver_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn release_funds_handler(ctx: Context<ReleaseFunds>, bump: u8) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;

    validate_release_conditions(escrow, &ctx.accounts.release_signer.key())?;

    escrow.flags.release = true;

    let authority_seeds = &[b"escrow", escrow.engagement_id.as_bytes(), &[bump]];

    let fee_result: StandardFeeResult = FeeCalculator::calculate_standard_fees(
        escrow.amount,
        escrow.platform_fee,
    )?;

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

    transfer(
        CpiContext::new_with_signer(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.escrow_token_account.to_account_info(),
                to: ctx.accounts.receiver_account.to_account_info(),
                authority: ctx.accounts.escrow_authority.to_account_info(),
            },
            &[authority_seeds],
        ),
        fee_result.receiver_amount as u64,
    )?;

    // emit_escrow_event(escrow.engagement_id.clone(), *escrow);

    Ok(())
}

#[derive(Accounts)]
pub struct ChangeEscrowProperties<'info> {
    #[account(mut)]
    pub platform_signer: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
}

pub fn change_escrow_properties_handler(
    ctx: Context<ChangeEscrowProperties>,
    new_data: EscrowData,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    let balance = ctx.accounts.escrow_token_account.amount;
    validate_escrow_property_change_conditions(
        escrow,
        &ctx.accounts.platform_signer.key(),
        balance as i128,
        &new_data.milestones,
    )?;

    // *escrow = new_data;
    // emit_escrow_event(escrow.engagement_id.clone(), escrow.clone());

    Ok(())
}

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

pub fn fund_escrow_handler(ctx: Context<FundEscrow>, amount: u64) -> Result<()> {
    let escrow = &ctx.accounts.escrow_account;
    let signer_balance = ctx.accounts.user_token_account.amount;
    let contract_balance = ctx.accounts.escrow_token_account.amount;

    validate_funding_conditions(
        escrow,
        signer_balance as i128,
        contract_balance as i128,
        amount as i128,
    )?;

    transfer(
        CpiContext::new(
            ctx.accounts.token_program.to_account_info(),
            Transfer {
                from: ctx.accounts.user_token_account.to_account_info(),
                to: ctx.accounts.escrow_token_account.to_account_info(),
                authority: ctx.accounts.signer.to_account_info(),
            },
        ),
        amount,
    )?;

    Ok(())
}

#[derive(Accounts)]
pub struct GetEscrow<'info> {
    pub escrow_account: AccountInfo<'info>,
}


pub fn get_escrow_handler(ctx: Context<GetEscrow>) -> std::result::Result<EscrowData, EscrowError> {
    let account_info = &ctx.accounts.escrow_account;

    if account_info.data_is_empty() {
        return Err(EscrowError::EscrowNotFound);
    }

    let escrow_data: EscrowData = EscrowData::try_deserialize(&mut &account_info.data.borrow()[..])
    .map_err(|_| EscrowError::DeserializationFailed)?;
    Ok(escrow_data)
}