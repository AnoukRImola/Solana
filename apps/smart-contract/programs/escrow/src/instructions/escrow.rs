use anchor_lang::prelude::*;

use crate::{
    context::{InitializeEscrow, FundEscrow, ChangeEscrowProperties, ReleaseFunds, GetEscrow},
    errors::EscrowError,
    state::EscrowData,
    utils::{
        fee_calculator::{FeeCalculator, FeeCalculatorTrait, StandardFeeResult},
        escrow_validators::{
            validate_escrow_property_change_conditions, validate_funding_conditions,
            validate_release_conditions, validate_initialize_escrow_conditions
        },
        token_transfer_handler::{transfer_from_escrow, transfer_to_escrow, has_sufficient_balance},
        events::{EscrowInitialized, EscrowFunded, FundsReleased, EscrowPropertiesChanged},
    }
};


pub fn initialize_escrow_handler(ctx: Context<InitializeEscrow>, new_escrow: EscrowData) -> Result<EscrowData> {
    validate_initialize_escrow_conditions(&new_escrow)?;

    let escrow = &mut ctx.accounts.escrow_account;
    **escrow = new_escrow.clone();
    escrow.is_initialized = true;
    escrow.balance = 0;

    emit!(EscrowInitialized {
        escrow_id: escrow.engagement_id.clone(),
        initializer: ctx.accounts.initializer.key(),
    });

    Ok(new_escrow)
}

pub fn release_funds_handler(ctx: Context<ReleaseFunds>) -> Result<()> {
    let escrow_account_info = ctx.accounts.escrow_account.to_account_info();
    let escrow = &mut ctx.accounts.escrow_account;

    validate_release_conditions(escrow, &ctx.accounts.release_signer.key())?;

    let fee_result: StandardFeeResult = FeeCalculator::calculate_standard_fees(
        escrow.amount,
        escrow.platform_fee,
    )?;

    let total_required = (fee_result.trustless_work_fee
        + fee_result.platform_fee
        + fee_result.receiver_amount) as u64;

    has_sufficient_balance(&ctx.accounts.escrow_token_account, total_required)?;

    escrow.flags.release = true;

    let bump = ctx.bumps.escrow_account;
    let engagement_id = escrow.engagement_id.clone();
    let binding = [bump];
    let authority_seeds: &[&[u8]] = &[b"escrow", engagement_id.as_bytes(), &binding];

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

    emit!(FundsReleased {
        escrow_id: engagement_id,
        release_signer: ctx.accounts.release_signer.key(),
        receiver_amount: fee_result.receiver_amount,
    });

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

    let engagement_id = escrow.engagement_id.clone();
    let is_initialized = escrow.is_initialized;
    let current_balance = escrow.balance;

    **escrow = new_data;
    escrow.is_initialized = is_initialized;
    escrow.balance = current_balance;

    emit!(EscrowPropertiesChanged {
        escrow_id: engagement_id,
        platform_address: ctx.accounts.platform_signer.key(),
    });

    Ok(())
}

pub fn fund_escrow_handler(ctx: Context<FundEscrow>, amount: u64) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;
    let signer_balance = ctx.accounts.user_token_account.amount;
    let contract_balance = ctx.accounts.escrow_token_account.amount;

    validate_funding_conditions(
        escrow,
        signer_balance as i128,
        contract_balance as i128,
        amount as i128,
    )?;

    transfer_to_escrow(
        amount,
        ctx.accounts.user_token_account.to_account_info(),
        ctx.accounts.escrow_token_account.to_account_info(),
        ctx.accounts.signer.to_account_info(),
        ctx.accounts.token_program.to_account_info(),
    )?;

    escrow.balance = ctx.accounts.escrow_token_account.amount + amount;

    emit!(EscrowFunded {
        escrow_id: escrow.engagement_id.clone(),
        funder: ctx.accounts.signer.key(),
        amount,
    });

    Ok(())
}

pub fn get_escrow_handler(ctx: Context<GetEscrow>) -> Result<EscrowData> {
    let account_info = &ctx.accounts.escrow_account;

    if account_info.data_is_empty() {
        return Err(EscrowError::EscrowNotFound.into());
    }

    let escrow_data: EscrowData = EscrowData::try_deserialize(&mut &account_info.data.borrow()[..])
    .map_err(|_| EscrowError::DeserializationFailed)?;
    Ok(escrow_data)
}
