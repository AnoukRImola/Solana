use crate::*;

#[error_code]
pub enum TokenError {
    #[msg("Admin address dismatch")]
    InvalidAdmin,

    #[msg("Token address dismatch")]
    InvalidToken,

    #[msg("Token amount is not enough for all stages")]
    NotEnoughTo,

    #[msg("Token number is not correct")]
    TokenNumberInvalid,
    
    #[msg("Token is not started")]
    TokenNotStarted,
    
    #[msg("Token is ended")]
    TokenEnded,
    
    #[msg("Token is paused")]
    TokenPaused,
    
    #[msg("Pyth feed address is not right")]
    InvalidPriceFeed,
    
    #[msg("Stable token address is not right")]
    InvalidStableToken,
}