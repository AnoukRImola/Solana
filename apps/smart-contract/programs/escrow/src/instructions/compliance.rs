use anchor_lang::prelude::*;

use crate::{
    context::{
        InitializeComplianceRegistry, CloseComplianceRegistry, VerifyAddress,
        RevokeVerification, SetEscrowCompliance, SetTravelRuleData,
    },
    state::TravelRuleData,
    utils::{
        compliance_validators::validate_jurisdiction,
        events::{
            ComplianceRegistryInitialized, AddressKycVerified,
            AddressKycRevoked, EscrowComplianceSet, TravelRuleDataSet,
        },
    },
};

pub fn initialize_compliance_registry_handler(
    ctx: Context<InitializeComplianceRegistry>,
    travel_rule_threshold: u64,
) -> Result<()> {
    let registry = &mut ctx.accounts.registry;
    registry.authority = ctx.accounts.authority.key();
    registry.travel_rule_threshold = travel_rule_threshold;
    registry.is_initialized = true;

    emit!(ComplianceRegistryInitialized {
        authority: registry.authority,
        travel_rule_threshold,
    });

    Ok(())
}

pub fn close_compliance_registry_handler(
    _ctx: Context<CloseComplianceRegistry>,
) -> Result<()> {
    // Account is closed by the `close = authority` constraint
    Ok(())
}

pub fn verify_address_handler(
    ctx: Context<VerifyAddress>,
    kyc_provider: String,
    jurisdiction: String,
    risk_score: u8,
) -> Result<()> {
    validate_jurisdiction(&jurisdiction)?;

    let verification = &mut ctx.accounts.verification;
    verification.address = ctx.accounts.address.key();
    verification.kyc_verified = true;
    verification.kyc_provider = kyc_provider.clone();
    verification.kyc_timestamp = Clock::get()?.unix_timestamp;
    verification.risk_score = risk_score;
    verification.jurisdiction = jurisdiction.clone();

    emit!(AddressKycVerified {
        address: verification.address,
        kyc_provider,
        jurisdiction,
        risk_score,
    });

    Ok(())
}

pub fn revoke_verification_handler(
    ctx: Context<RevokeVerification>,
) -> Result<()> {
    let address = ctx.accounts.verification.address;

    emit!(AddressKycRevoked { address });

    // Account is closed by the `close = authority` constraint
    Ok(())
}

pub fn set_escrow_compliance_handler(
    ctx: Context<SetEscrowCompliance>,
    requires_kyc: bool,
) -> Result<()> {
    let compliance = &mut ctx.accounts.compliance;
    compliance.escrow_address = ctx.accounts.escrow_address.key();
    compliance.requires_kyc = requires_kyc;
    compliance.travel_rule = None;

    emit!(EscrowComplianceSet {
        escrow_address: compliance.escrow_address,
        requires_kyc,
    });

    Ok(())
}

pub fn set_travel_rule_data_handler(
    ctx: Context<SetTravelRuleData>,
    travel_rule: TravelRuleData,
) -> Result<()> {
    validate_jurisdiction(&travel_rule.originator_jurisdiction)?;
    validate_jurisdiction(&travel_rule.beneficiary_jurisdiction)?;

    let compliance = &mut ctx.accounts.compliance;
    let escrow_address = compliance.escrow_address;
    compliance.travel_rule = Some(travel_rule);

    emit!(TravelRuleDataSet { escrow_address });

    Ok(())
}
