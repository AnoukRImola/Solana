use anchor_lang::prelude::*;

pub mod error;
pub mod instructions {
    pub mod dispute;
    pub mod escrow;
    pub mod milestone;
}
pub mod state {
    pub mod types;
}

pub mod utils;

// #[cfg(not(feature = "no-entrypoint"))]
declare_id!("Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkgMTbSpNz63a");

#[program]
pub mod entrypoint {
    use super::*;

    pub mod escrow_solana {
        use crate::{error::EscrowError, state::types::EscrowData};

        use super::*;

        pub fn initialize_escrow(
            ctx: Context<instructions::escrow::InitializeEscrow>,
            new_escrow: EscrowData,
        ) -> std::result::Result<EscrowData, EscrowError> {
            instructions::escrow::initialize_escrow_handler(ctx, new_escrow)
        }

        pub fn get_escrow(
            ctx: Context<instructions::escrow::GetEscrow>,
        ) -> std::result::Result<EscrowData, EscrowError> {
            instructions::escrow::get_escrow_handler(ctx)
        }

        pub fn resolve_dispute(
            ctx: Context<instructions::dispute::ResolveDispute>,
            approver_funds: i128,
            provider_funds: i128,
            escrow_bump: u8,
        ) -> Result<()> {
            instructions::dispute::resolve_dispute_handler(ctx, approver_funds, provider_funds, escrow_bump)
        }

        pub fn change_dispute_flag(ctx: Context<instructions::dispute::ChangeDisputeFlag>) -> Result<()> {
            instructions::dispute::change_dispute_flag_handler(ctx)
        }

        pub fn release_funds(ctx: Context<instructions::escrow::ReleaseFunds>, escrow_bump: u8,) -> Result<()> {
            instructions::escrow::release_funds_handler(ctx, escrow_bump)
        }

        pub fn change_escrow_properties(
            ctx: Context<instructions::escrow::ChangeEscrowProperties>,
            new_data: state::types::EscrowData,
        ) -> Result<()> {
            instructions::escrow::change_escrow_properties_handler(ctx, new_data)
        }

        pub fn fund_escrow(ctx: Context<instructions::escrow::FundEscrow>, amount: u64) -> Result<()> {
            instructions::escrow::fund_escrow_handler(ctx, amount)
        }

        pub fn change_milestone_status(
            ctx: Context<instructions::milestone::ChangeMilestoneStatus>,
            milestone_index: usize,
            new_status: String,
            new_evidence: Option<String>,
        ) -> Result<()> {
            instructions::milestone::change_milestone_status_handler(
                ctx,
                milestone_index,
                new_status,
                new_evidence,
            )
        }

        pub fn change_milestone_flag(
            ctx: Context<instructions::milestone::ChangeMilestoneFlag>,
            milestone_index: usize,
            new_flag: bool,
        ) -> Result<()> {
            instructions::milestone::change_milestone_flag_handler(ctx, milestone_index, new_flag)
        }
    }
}