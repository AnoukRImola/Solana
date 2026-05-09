#![allow(unexpected_cfgs)]
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
declare_id!("8LvnKBjEobkQGsu3SkzCGTwrZaXzMZh1X4Wj5ZGcmqwW");

#[program]
pub mod escrow {
    use super::*;

    // ============================
    // Single-Release Instructions
    // ============================

    pub fn initialize_escrow(
        ctx: Context<InitializeEscrow>,
        new_escrow: state::EscrowData,
    ) -> Result<EscrowData>  {
        instructions::escrow::initialize_escrow_handler(ctx, new_escrow)
    }

    pub fn get_escrow(
        ctx: Context<GetEscrow>,
    ) -> Result<EscrowData>  {
        instructions::escrow::get_escrow_handler(ctx)
    }

    pub fn resolve_dispute(
        ctx: Context<ResolveDispute>,
        approver_funds: i128,
        provider_funds: i128,
    ) -> Result<()> {
        instructions::dispute::resolve_dispute_handler(ctx, approver_funds, provider_funds)
    }

    pub fn change_dispute_flag(ctx: Context<ChangeDisputeFlag>) -> Result<()> {
        instructions::dispute::change_dispute_flag_handler(ctx)
    }

    pub fn release_funds(ctx: Context<ReleaseFunds>) -> Result<()> {
        instructions::escrow::release_funds_handler(ctx)
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
        milestone_index: u32,
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
        milestone_index: u32,
        new_flag: bool,
    ) -> Result<()> {
        instructions::milestone::change_milestone_flag_handler(ctx, milestone_index, new_flag)
    }

    pub fn cancel_escrow(ctx: Context<CancelEscrow>) -> Result<()> {
        instructions::escrow::cancel_escrow_handler(ctx)
    }

    // ============================
    // Multi-Release Instructions
    // ============================

    pub fn initialize_multi_release_escrow(
        ctx: Context<InitializeMultiReleaseEscrow>,
        new_escrow: state::MultiReleaseEscrowData,
    ) -> Result<()> {
        instructions::multi_release::initialize_multi_release_escrow_handler(ctx, new_escrow)
    }

    pub fn fund_multi_release_escrow(
        ctx: Context<FundMultiReleaseEscrow>,
        amount: u64,
    ) -> Result<()> {
        instructions::multi_release::fund_multi_release_escrow_handler(ctx, amount)
    }

    pub fn change_multi_release_milestone_status(
        ctx: Context<ChangeMultiReleaseMilestoneStatus>,
        milestone_index: u32,
        new_status: String,
        new_evidence: Option<String>,
    ) -> Result<()> {
        instructions::multi_release::change_multi_release_milestone_status_handler(
            ctx, milestone_index, new_status, new_evidence,
        )
    }

    pub fn approve_multi_release_milestone(
        ctx: Context<ApproveMultiReleaseMilestone>,
        milestone_index: u32,
        approved: bool,
    ) -> Result<()> {
        instructions::multi_release::approve_multi_release_milestone_handler(
            ctx, milestone_index, approved,
        )
    }

    pub fn release_milestone_funds(
        ctx: Context<ReleaseMilestoneFunds>,
        milestone_index: u32,
    ) -> Result<()> {
        instructions::multi_release::release_milestone_funds_handler(ctx, milestone_index)
    }

    pub fn dispute_milestone(
        ctx: Context<DisputeMultiReleaseMilestone>,
        milestone_index: u32,
    ) -> Result<()> {
        instructions::multi_release::dispute_multi_release_milestone_handler(ctx, milestone_index)
    }

    pub fn resolve_milestone_dispute(
        ctx: Context<ResolveMultiReleaseMilestoneDispute>,
        milestone_index: u32,
        approver_funds: i128,
        receiver_funds: i128,
    ) -> Result<()> {
        instructions::multi_release::resolve_multi_release_milestone_dispute_handler(
            ctx, milestone_index, approver_funds, receiver_funds,
        )
    }

    pub fn withdraw_remaining_funds(
        ctx: Context<WithdrawRemainingFunds>,
    ) -> Result<()> {
        instructions::multi_release::withdraw_remaining_funds_handler(ctx)
    }

    // ============================
    // Compliance Instructions
    // ============================

    pub fn initialize_compliance_registry(
        ctx: Context<InitializeComplianceRegistry>,
        travel_rule_threshold: u64,
    ) -> Result<()> {
        instructions::compliance::initialize_compliance_registry_handler(ctx, travel_rule_threshold)
    }

    pub fn close_compliance_registry(
        ctx: Context<CloseComplianceRegistry>,
    ) -> Result<()> {
        instructions::compliance::close_compliance_registry_handler(ctx)
    }

    pub fn verify_address(
        ctx: Context<VerifyAddress>,
        kyc_provider: String,
        jurisdiction: String,
        risk_score: u8,
    ) -> Result<()> {
        instructions::compliance::verify_address_handler(ctx, kyc_provider, jurisdiction, risk_score)
    }

    pub fn revoke_verification(
        ctx: Context<RevokeVerification>,
    ) -> Result<()> {
        instructions::compliance::revoke_verification_handler(ctx)
    }

    pub fn set_escrow_compliance(
        ctx: Context<SetEscrowCompliance>,
        requires_kyc: bool,
    ) -> Result<()> {
        instructions::compliance::set_escrow_compliance_handler(ctx, requires_kyc)
    }

    pub fn set_travel_rule_data(
        ctx: Context<SetTravelRuleData>,
        travel_rule: state::TravelRuleData,
    ) -> Result<()> {
        instructions::compliance::set_travel_rule_data_handler(ctx, travel_rule)
    }
}
