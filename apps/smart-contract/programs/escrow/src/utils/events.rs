use crate::state::EscrowData;
use anchor_lang::prelude::*;

#[event]
pub struct EscrowPublished {
    pub escrow_id: String,
    pub escrow_data: EscrowData,
}

// pub fn emit_escrow_event(escrow_id: String, escrow_data: EscrowData) {
//     emit!(EscrowPublished {
//         escrow_id,
//         escrow_data,
//     });
// }
