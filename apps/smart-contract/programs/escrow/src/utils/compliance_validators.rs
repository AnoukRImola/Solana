use crate::{
    errors::EscrowError,
    state::AddressVerification,
};

/// List of sanctioned jurisdiction ISO codes.
const SANCTIONED_JURISDICTIONS: &[&str] = &["KP", "IR", "SY", "CU"];

pub fn require_kyc_verified(verification: &AddressVerification) -> Result<(), EscrowError> {
    if !verification.kyc_verified {
        return Err(EscrowError::AddressNotKycVerified);
    }
    Ok(())
}

pub fn validate_jurisdiction(jurisdiction: &str) -> Result<(), EscrowError> {
    if SANCTIONED_JURISDICTIONS.contains(&jurisdiction) {
        return Err(EscrowError::SanctionedJurisdiction);
    }
    Ok(())
}
