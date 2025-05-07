use anchor_lang::{prelude::*, Accounts};
use anchor_spl::token::{Token, TokenAccount};

use crate::state::EscrowData;


/// DISPUTE CONTEXT
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

#[derive(Accounts)]
pub struct ChangeDisputeFlag<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
}

/// ESCROW CONTEXT
#[derive(Accounts)]
pub struct InitializeEscrow<'info> {
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
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

#[derive(Accounts)]
pub struct ChangeEscrowProperties<'info> {
    #[account(mut)]
    pub platform_signer: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
    #[account(mut)]
    pub escrow_token_account: Account<'info, TokenAccount>,
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

#[derive(Accounts)]
pub struct GetEscrow<'info> {
    pub escrow_account: AccountInfo<'info>,
}

/// MILESTONE CONTEXT

#[derive(Accounts)]
pub struct ChangeMilestoneStatus<'info> {
    #[account(mut)]
    pub service_provider: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
}

#[derive(Accounts)]
pub struct ChangeMilestoneFlag<'info> {
    #[account(mut)]
    pub approver: Signer<'info>,
    #[account(mut)]
    pub escrow_account: Account<'info, EscrowData>,
}