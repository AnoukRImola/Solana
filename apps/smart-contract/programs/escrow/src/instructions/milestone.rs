use anchor_lang::prelude::*;

use crate::{
    context::{ChangeMilestoneFlag, ChangeMilestoneStatus},
    errors::EscrowError,
    milestone_validators::{
        validate_milestone_flag_change_conditions,
        validate_milestone_status_change_conditions,
    },
    utils::events::{MilestoneUpdated, MilestoneApproved},
};

pub fn change_milestone_status_handler(
    ctx: Context<ChangeMilestoneStatus>,
    milestone_index: u32,
    new_status: String,
    new_evidence: Option<String>,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;

    validate_milestone_status_change_conditions(
        escrow,
        milestone_index,
        &ctx.accounts.service_provider.key(),
    )?;

    if let Some(milestone) = escrow.milestones.get_mut(milestone_index as usize) {
        milestone.status = new_status.clone();
        if let Some(evidence) = new_evidence {
            milestone.evidence = evidence;
        }
    } else {
        return Err(EscrowError::InvalidMileStoneIndex.into());
    }

    emit!(MilestoneUpdated {
        escrow_id: escrow.engagement_id.clone(),
        milestone_index,
        new_status,
    });

    Ok(())
}

pub fn change_milestone_flag_handler(
    ctx: Context<ChangeMilestoneFlag>,
    milestone_index: u32,
    new_flag: bool,
) -> Result<()> {
    let escrow = &mut ctx.accounts.escrow_account;

    validate_milestone_flag_change_conditions(
        escrow,
        milestone_index,
        &ctx.accounts.approver.key(),
    )?;

    if let Some(milestone) = escrow.milestones.get_mut(milestone_index as usize) {
        milestone.approved_flag = new_flag;
    } else {
        return Err(EscrowError::InvalidMileStoneIndex.into());
    }

    emit!(MilestoneApproved {
        escrow_id: escrow.engagement_id.clone(),
        milestone_index,
        approved: new_flag,
    });

    Ok(())
}
