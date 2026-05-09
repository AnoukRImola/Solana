import { Escrow } from 'src/interfaces/escrow.interface';
import type { Milestone } from './milestone.interface';

export interface ApiResponse {
  status: string;
  unsignedTransaction?: string;
  unsignedConversionTransaction?: string;
  txHash?: string;
  message?: string;
  contract_id?: string;
  engagement_id?: string;
  escrow?: EscrowCamelCaseResponse;
}

export interface escrowResponse {
  engagementId: string;
  title: string;
  description: string;
  approver: string;
  service_provider: string;
  platform_address: string;
  amount: number;
  platform_fee: number;
  milestones: Milestone[];
  release_signer: string;
  dispute_resolver: string;
  dispute_flag: string;
}

export interface EscrowCamelCaseResponse extends Escrow {}
