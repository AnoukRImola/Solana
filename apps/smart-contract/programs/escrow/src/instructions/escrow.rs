use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Transfer};

use crate::{
    context::{InitializeEscrow, FundEscrow, ChangeEscrowProperties, ReleaseFunds, GetEscrow}, 
    errors::EscrowError,
    state::EscrowData, 
    utils::{
        fee::calculator::{FeeCalculator, FeeCalculatorTrait, StandardFeeResult},
        validators::escrow::{
            validate_escrow_property_change_conditions, validate_funding_conditions, validate_release_conditions, validate_initialize_escrow_conditions
        },
        token::transfer_handler::{transfer_from_escrow, has_sufficient_balance},
        // events::emit_escrow_event,
    }
};


pub fn initialize_escrow_handler(ctx: Context<InitializeEscrow>, new_escrow: EscrowData) -> std::result::Result<EscrowData, EscrowError> {
    let escrow = &mut ctx.accounts.escrow_account;
    let escrow_account_info = escrow.to_account_info();

    validate_initialize_escrow_conditions(&escrow_account_info, &new_escrow)?;

    **escrow = new_escrow.clone();
    Ok(new_escrow)
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

    let escrow_token_account = &ctx.accounts.escrow_token_account;

    let total_required = (fee_result.trustless_work_fee
        + fee_result.platform_fee
        + fee_result.receiver_amount) as u64;

    // Validación importante:
    has_sufficient_balance(escrow_token_account, total_required)?;

    // Transferencias
    transfer_from_escrow(
        fee_result.trustless_work_fee as u64,
        escrow_token_account.to_account_info(),
        ctx.accounts.trustless_work_account.to_account_info(),
        ctx.accounts.escrow_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    transfer_from_escrow(
        fee_result.platform_fee as u64,
        escrow_token_account.to_account_info(),
        ctx.accounts.platform_account.to_account_info(),
        ctx.accounts.escrow_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    transfer_from_escrow(
        fee_result.receiver_amount as u64,
        escrow_token_account.to_account_info(),
        ctx.accounts.receiver_account.to_account_info(),
        ctx.accounts.escrow_authority.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
        authority_seeds,
    )?;

    Ok(())
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

pub fn get_escrow_handler(ctx: Context<GetEscrow>) -> std::result::Result<EscrowData, EscrowError> {
    let account_info = &ctx.accounts.escrow_account;

    if account_info.data_is_empty() {
        return Err(EscrowError::EscrowNotFound);
    }

    let escrow_data: EscrowData = EscrowData::try_deserialize(&mut &account_info.data.borrow()[..])
    .map_err(|_| EscrowError::DeserializationFailed)?;
    Ok(escrow_data)
}