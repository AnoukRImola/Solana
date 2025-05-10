#![allow(unexpected_cfgs)]
use anchor_lang::prelude::*;
use instructions::__client_accounts_buy;

pub mod error;
pub mod instructions;
pub mod constant;
pub mod state;
pub mod utils;
use constant::*;
use error::*;
use instructions::*;
use state::*;
use utils::*;

declare_id!("6En2g3XUQgZSBEgBE1DF1sVeRik4KNvug151Zswz8oR5");

#[program]
pub mod token {
    use super::*;
        
    //  called by contract deployer only 1 time to initialize global values
    //  send SOL to global_account and initialize the global states
    pub fn initialize(
        ctx: Context<Initialize>
    ) -> Result<()> {
        Initialize::process_instruction(ctx)
    }

    //  Admin can hand over admin role
    pub fn change_admin(ctx: Context<ChangeAdmin>, new_admin: Pubkey) -> Result<()> {
        change_admin::process_change_admin(ctx, new_admin)
    }

    //  Admin can set the vault address
    pub fn set_vault_address(
        ctx: Context<SetVaultAddress>
    ) -> Result<()> {
        SetVaultAddress::process_instruction(ctx)
    }

    //  Admin can start the token
    pub fn start_token(
        ctx: Context<StartToken>
    ) -> Result<()> {
        StartToken::process_instruction(ctx)
    }

    //  Admin can start the pause/resume token
    //  @param - live: pause token if true, resume token 
    pub fn set_live(
        ctx: Context<SetLive>,
        live: bool
    ) -> Result<()> {
        SetLive::process_instruction(ctx, live)
    }

    //  Admin can set the stage number
    pub fn set_stage(
        ctx: Context<SetStage>,
        stage: u8
    ) -> Result<()> {
        SetStage::process_instruction(ctx, stage)
    }

    //  Initialize user state
    pub fn init_user(
        ctx: Context<InitUser>
    ) -> Result<()> {
        InitUser::process_instruction(ctx)
    }

    //  Buy with SOL
    pub fn buy(
        ctx: Context<Buy>, 
        sol_amount: u64
    ) -> Result<()> {
        Buy::process_instruction(ctx, sol_amount)
    }

    //  Buy with USDC/USDT
    pub fn buy_with_stable_coin(
        ctx: Context<BuyWithStableCoin>, 
        stable_token_amount: u64
    ) -> Result<()> {
        BuyWithStableCoin::process_instruction(ctx, stable_token_amount)
    }
}