use anchor_lang::prelude::*;
use anchor_spl::token::{TokenAccount, Transfer, transfer};
use crate::errors::EscrowError;

pub fn has_sufficient_balance(account: &TokenAccount, amount: u64) -> Result<()> {
    if account.amount < amount {
        return Err(EscrowError::EscrowBalanceNotEnoughToSendEarnings.into());
    }
    Ok(())
}

/// Transfer tokens FROM the escrow token account using PDA authority (signed CPI).
/// Used for release_funds and resolve_dispute.
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

/// Transfer tokens TO the escrow token account using the user's signer authority.
/// Used for fund_escrow where the user signs the transfer directly.
pub fn transfer_to_escrow<'info>(
    amount: u64,
    from: AccountInfo<'info>,
    to: AccountInfo<'info>,
    authority: AccountInfo<'info>,
    token_program: AccountInfo<'info>,
) -> Result<()> {
    transfer(
        CpiContext::new(
            token_program,
            Transfer {
                from,
                to,
                authority,
            },
        ),
        amount,
    )
}
