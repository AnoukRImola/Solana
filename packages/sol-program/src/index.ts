// Simple Solana Types

import { PublicKey } from '@solana/web3.js';

// ----- Escrow Program -----

export const ESCROW_PROGRAM_ID = new PublicKey('9AKiQ65rfHuMBjNs44CSKKMTE5pYE9soXR8dHiTfU6bo');

// Account Types
export type EscrowData = {
  engagementId: string;
  title: string;
  description: string;
  amount: number; // i128
  platformFee: number; // i128
  milestones: Milestone[];
  flags: Flags;
  trustline: Trustline;
  receiverMemo: number; // i128
  roles: Roles;
};

// Custom Types
export type Milestone = {
  description: string;
  status: string;
  evidence: string;
  approvedFlag: boolean;
};

export type Roles = {
  approver: PublicKey;
  serviceProvider: PublicKey;
  platformAddress: PublicKey;
  releaseSigner: PublicKey;
  disputeResolver: PublicKey;
  receiver: PublicKey;
};

export type Flags = {
  dispute: boolean;
  release: boolean;
  resolved: boolean;
};

export type Trustline = {
  address: PublicKey;
  decimals: number; // i128
};

// Instruction Args
export type InitializeEscrowArgs = {
  newEscrow: EscrowData;
};

export type ResolveDisputeArgs = {
  approverFunds: number; // i128
  providerFunds: number; // i128
  escrowBump: number; // u8
};

export type ReleaseFundsArgs = {
  escrowBump: number; // u8
};

export type ChangeEscrowPropertiesArgs = {
  newData: EscrowData;
};

export type FundEscrowArgs = {
  amount: number; // u64
  bump: number; // u8
};

export type ChangeMilestoneStatusArgs = {
  milestoneIndex: number; // i128
  newStatus: string;
  newEvidence: string | null;
};

export type ChangeMilestoneFlagArgs = {
  milestoneIndex: number; // i128
  newFlag: boolean;
};

// ----- Token Program -----

export const TOKEN_PROGRAM_ID = new PublicKey('8xrypu8aeupEFyGCsp6Gq5QtFP32iT6g3Yy2g3EucxGY');

// Account Types
export type GlobalState = {
  admin: PublicKey;
  vault: PublicKey;
  tokenSold: number; // u64
  tokenSoldUsd: number; // u64
  isLive: boolean;
  stageIterator: number; // u8
  remainTokens: number[]; // u64[]
};

export type UserState = {
  user: PublicKey;
  tokens: number; // u64
  paidSol: number; // u64
  paidUsd: number; // u64
};

// Instruction Args
export type ChangeAdminArgs = {
  newAdmin: PublicKey;
};

export type SetLiveArgs = {
  live: boolean;
};

export type SetStageArgs = {
  stage: number; // u8
};

export type BuyArgs = {
  solAmount: number; // u64
};

export type BuyWithStableCoinArgs = {
  stableTokenAmount: number; // u64
};
