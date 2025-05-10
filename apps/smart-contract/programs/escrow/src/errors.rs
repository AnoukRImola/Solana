use anchor_lang::prelude::*;

#[error_code]
pub enum EscrowError {
    #[msg("Escrow not funded")] EscrowNotFunded,
    #[msg("Failed to deserialize escrow data.")] DeserializationFailed,
    #[msg("Amount cannot be zero")] AmountCannotBeZero,
    #[msg("Escrow already initialized")] EscrowAlreadyInitialized,
    #[msg("Only the signer can fund the escrow")] OnlySignerCanFundEscrow,
    #[msg("Escrow already funded")] EscrowAlreadyFunded,
    #[msg("Escrow already fully funded")] EscrowFullyFunded,
    #[msg("Signer has insufficient funds")] SignerInsufficientFunds,
    #[msg("Not enough allowance to fund this escrow")] NotEnoughAllowance,
    #[msg("Escrow already completed")] EscrowAlreadyCompleted,
    #[msg("Signer has insufficient funds to complete escrow")] SignerInsufficientFundsToComplete,
    #[msg("Only the signer can request a refund")] OnlySignerCanRequestRefund,
    #[msg("No funds available to refund")] NoFundsToRefund,
    #[msg("Contract has no balance to repay")] ContractHasInsufficientBalance,
    #[msg("Escrow not found")] EscrowNotFound,
    #[msg("Only the release signer can distribute earnings")] OnlyReleaseSignerCanDistributeEarnings,
    #[msg("Escrow not completed")] EscrowNotCompleted,
    #[msg("Escrow balance insufficient for distribution")] EscrowBalanceNotEnoughToSendEarnings,
    #[msg("Contract has insufficient funds")] ContractInsufficientFunds,
    #[msg("Only platform address may execute this function")] OnlyPlatformAddressExecuteThisFunction,
    #[msg("Escrow not initialized")] EscrowNotInitialized,
    #[msg("Only the service provider can change milestone status")] OnlyServiceProviderChangeMilstoneStatus,
    #[msg("No milestones defined")] NoMileStoneDefined,
    #[msg("Invalid milestone index")] InvalidMileStoneIndex,
    #[msg("Only the approver can change milestone flag")] OnlyApproverChangeMilstoneFlag,
    #[msg("Only the dispute resolver can execute this function")] OnlyDisputeResolverCanExecuteThisFunction,
    #[msg("Escrow already in dispute")] EscrowAlreadyInDispute,
    #[msg("Escrow not in dispute")] EscrowNotInDispute,
    #[msg("Insufficient funds for resolution")] InsufficientFundsForResolution,
    #[msg("Invalid state")] InvalidState,
    #[msg("Escrow opened for dispute resolution")] EscrowOpenedForDisputeResolution,
    #[msg("Amount to deposit is greater than escrow amount")] AmountToDepositGreatherThanEscrowAmount,
    #[msg("Operation may cause overflow")] Overflow,
    #[msg("Operation may cause underflow")] Underflow,
    #[msg("Operation may cause division error")] DivisionError,
    #[msg("Admin not found")] AdminNotFound,
    #[msg("Insufficient approver funds for commissions")] InsufficientApproverFundsForCommissions,
    #[msg("Insufficient service provider funds for commissions")] InsufficientServiceProviderFundsForCommissions,
    #[msg("Milestone approved, can't change escrow properties")] MilestoneApprovedCantChangeEscrowProperties,
    #[msg("Escrow has funds")] EscrowHasFunds,
    #[msg("Escrow already resolved")] EscrowAlreadyResolved,
    #[msg("Too many escrows requested")] TooManyEscrowsRequested,
    #[msg("Unauthorized to change dispute flag")] UnauthorizedToChangeDisputeFlag,
    #[msg("Argument conversion failed")] ArgumentConversionFailed,
    #[msg("Too many milestones in escrow")] TooManyMilestones,
    #[msg("Allowance has expired")]
    AllowanceExpired,
    #[msg("Insufficient allowance")]
    InsufficientAllowance,
    #[msg("Invalid expiration slot")]
    InvalidExpirationSlot,
    #[msg("Decimal must not be greater than 18")]
    DecimalExceedsLimit,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Invalid decimals")]
    InvalidDecimals,
    #[msg("Already initialized")]
    AlreadyInitialized,
}
