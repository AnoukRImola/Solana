use anchor_lang::prelude::*;

mod context;
mod errors;
mod instructions;
mod utils;
mod state;

pub use context::*;
pub use errors::*;
pub use state::*;
pub use utils::*;
pub use instructions::*;

#[cfg(not(feature = "dev"))]
declare_id!("A2f8EQ1iYEFLkiN1UTDBkMYKR2Hxw7vqBb8srcVjGxk4");

#[program]
pub mod escrow {
    use super::*;

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        new_escrow: state::EscrowData,
    ) -> std::result::Result<EscrowData, EscrowError>  {
        instructions::escrow::initialize_escrow_handler(ctx, new_escrow)
    }

    pub fn get_escrow(
        ctx: Context<GetEscrow>,
    ) -> std::result::Result<EscrowData, EscrowError>  {
        instructions::escrow::get_escrow_handler(ctx)
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        approver_funds: i128,
        provider_funds: i128,
        escrow_bump: u8,
    ) -> Result<()> {
        instructions::dispute::resolve_dispute_handler(ctx, approver_funds, provider_funds, escrow_bump)
    }

    pub fn change_dispute_flag(ctx: Context<ChangeDisputeFlag>) -> Result<()> {
        instructions::dispute::change_dispute_flag_handler(ctx)
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>, escrow_bump: u8,) -> Result<()> {
        instructions::escrow::release_funds_handler(ctx, escrow_bump)
    }

    pub fn change_escrow_properties(
        ctx: Context<ChangeEscrowProperties>,
        new_data: state::EscrowData,
    ) -> Result<()> {
        instructions::escrow::change_escrow_properties_handler(ctx, new_data)
    }

    pub fn fund_escrow(ctx: Context<FundEscrow>, amount: u64) -> Result<()> {
        instructions::escrow::fund_escrow_handler(ctx, amount)
    }

    pub fn change_milestone_status(
        ctx: Context<ChangeMilestoneStatus>,
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
        ctx: Context<ChangeMilestoneFlag>,
        milestone_index: usize,
        new_flag: bool,
    ) -> Result<()> {
        instructions::milestone::change_milestone_flag_handler(ctx, milestone_index, new_flag)
    }
}