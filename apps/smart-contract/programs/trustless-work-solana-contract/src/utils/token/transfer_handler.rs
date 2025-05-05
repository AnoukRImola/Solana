use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Transfer, transfer};

use crate::error::EscrowError;

pub fn has_sufficient_balance(account: &TokenAccount, amount: u64) -> Result<()> {
    if account.amount < amount {
        return Err(EscrowError::EscrowBalanceNotEnoughToSendEarnings.into());
    }
    Ok(())
}

pub fn balance(account: &TokenAccount) -> u64 {
    account.amount
}

pub fn transfer_from_escrow<'info>(
    amount: u64,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
    authority_seeds: &[&[u8]],
) -> Result<()> {
    transfer(
        CpiContext::new_with_signer(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
            &[authority_seeds],
        ),
        amount,
    )
}