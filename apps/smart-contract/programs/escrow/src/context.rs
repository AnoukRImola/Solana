use anchor_lang::prelude::*;
use anchor_spl::token::{Token, TokenAccount};

use crate::errors::EscrowError;
use crate::state::{EscrowData, MultiReleaseEscrowData};

/// ESCROW CONTEXTS

#[derive(Accounts)]
#[instruction(new_escrow: EscrowData)]
pub struct InitializeEscrow<'info> {
    #[account(
        init,
        payer = initializer,
        space = EscrowData::space(new_escrow.milestones.len()),
        seeds = [b"escrow", new_escrow.engagement_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundEscrow<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ReleaseFunds<'info> {
    #[account(mut)]
    pub release_signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.release_signer == release_signer.key() @ EscrowError::OnlyReleaseSignerCanDistributeEarnings
    )]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
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
#[instruction(new_data: EscrowData)]
pub struct ChangeEscrowProperties<'info> {
    #[account(mut)]
    pub platform_signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.platform_address == platform_signer.key() @ EscrowError::OnlyPlatformAddressExecuteThisFunction,
        realloc = EscrowData::space(new_data.milestones.len()),
        realloc::payer = platform_signer,
        realloc::zero = false,
    )]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(
        token::authority = escrow_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct GetEscrow<'info> {
    /// CHECK: Read-only account, deserialized manually in handler.
    pub escrow_account: AccountInfo<'info>,
}

/// DISPUTE CONTEXTS

#[derive(Accounts)]
pub struct ResolveDispute<'info> {
    #[account(mut)]
    pub dispute_resolver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.dispute_resolver == dispute_resolver.key() @ EscrowError::OnlyDisputeResolverCanExecuteThisFunction
    )]
    pub escrow_account: Account<'info, EscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
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

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, EscrowData>,
}

/// MILESTONE CONTEXTS

#[derive(Accounts)]
pub struct ChangeMilestoneStatus<'info> {
    #[account(mut)]
    pub service_provider: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.service_provider == service_provider.key() @ EscrowError::OnlyServiceProviderChangeMilstoneStatus
    )]
    pub escrow_account: Account<'info, EscrowData>,
}

#[derive(Accounts)]
pub struct ChangeMilestoneFlag<'info> {
    #[account(mut)]
    pub approver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.approver == approver.key() @ EscrowError::OnlyApproverChangeMilstoneFlag
    )]
    pub escrow_account: Account<'info, EscrowData>,
}

// ============================
// Multi-Release Escrow Contexts
// ============================

#[derive(Accounts)]
#[instruction(new_escrow: MultiReleaseEscrowData)]
pub struct InitializeMultiReleaseEscrow<'info> {
    #[account(
        init,
        payer = initializer,
        space = MultiReleaseEscrowData::space(new_escrow.milestones.len()),
        seeds = [b"multi_escrow", new_escrow.engagement_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,

    #[account(mut)]
    pub initializer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct FundMultiReleaseEscrow<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct ChangeMultiReleaseMilestoneStatus<'info> {
    #[account(mut)]
    pub service_provider: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.service_provider == service_provider.key() @ EscrowError::OnlyServiceProviderChangeMilstoneStatus
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,
}

#[derive(Accounts)]
pub struct ApproveMultiReleaseMilestone<'info> {
    #[account(mut)]
    pub approver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.approver == approver.key() @ EscrowError::OnlyApproverChangeMilstoneFlag
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,
}

#[derive(Accounts)]
pub struct ReleaseMilestoneFunds<'info> {
    #[account(mut)]
    pub release_signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.release_signer == release_signer.key() @ EscrowError::OnlyReleaseSignerCanDistributeEarnings
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub trustless_work_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub platform_account: Account<'info, TokenAccount>,

    /// The token account of the milestone's receiver.
    #[account(mut)]
    pub receiver_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct DisputeMultiReleaseMilestone<'info> {
    #[account(mut)]
    pub signer: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,
}

#[derive(Accounts)]
pub struct ResolveMultiReleaseMilestoneDispute<'info> {
    #[account(mut)]
    pub dispute_resolver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.dispute_resolver == dispute_resolver.key() @ EscrowError::OnlyDisputeResolverCanExecuteThisFunction
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub trustless_work_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub platform_account: Account<'info, TokenAccount>,

    /// Token account of the approver (client).
    #[account(mut)]
    pub approver_account: Account<'info, TokenAccount>,

    /// Token account of the milestone's receiver.
    #[account(mut)]
    pub receiver_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct WithdrawRemainingFunds<'info> {
    #[account(mut)]
    pub approver: Signer<'info>,

    #[account(
        mut,
        seeds = [b"multi_escrow", escrow_account.engagement_id.as_bytes()],
        bump,
        constraint = escrow_account.roles.approver == approver.key() @ EscrowError::Unauthorized
    )]
    pub escrow_account: Account<'info, MultiReleaseEscrowData>,

    #[account(
        mut,
        token::authority = escrow_account
    )]
    pub escrow_token_account: Account<'info, TokenAccount>,

    #[account(mut)]
    pub approver_token_account: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
}
