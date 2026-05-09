import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsString, ValidateNested } from 'class-validator';

// Fund Escrow
export class FundEscrow {
  // Contract ID
  @ApiProperty({
    example: 'ENG12345',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Signer
  @ApiProperty({
    example: 'GSIGN...XYZ',
    description:
      'Entity that signs the transaction that deploys and initializes the escrow',
  })
  @IsString()
  signer: string;

  // Amount
  @ApiProperty({
    example: '100',
    description: 'Amount to transfer to the escrow contract',
  })
  @IsString()
  amount: string;
}

// Resolve Dispute
export class ResolvingDisputesType {
  // Contract ID
  @ApiProperty({
    example: 'CAZ6UQX7...',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Dispute Resolver
  @ApiProperty({
    example: 'GDISPUTE...XYZ',
    description: 'Address of the user defined to resolve disputes in an escrow',
  })
  @IsString()
  disputeResolver: string;

  // Approver Funds
  @ApiProperty({
    example: '300',
    description: 'Amount to transfer to the approver for dispute resolution',
  })
  @IsString()
  approverFunds: string;

  // Receiver Funds
  @ApiProperty({
    example: '700',
    description:
      'Amount to transfer to the service provider for dispute resolution',
  })
  @IsString()
  receiverFunds: string;
}

// Distribute Escrow Earnings
export class DistributeEscrowEarnings {
  // Contract ID
  @ApiProperty({
    example: 'CAZ6UQX7...',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Release Signer
  @ApiProperty({
    example: 'GREL...XYZ',
    description:
      'Address of the user in charge of releasing the escrow funds to the service provider',
  })
  @IsString()
  releaseSigner: string;
}

// Change Milestone Flag
export class ChangeMilestoneFlag {
  // Contract ID
  @ApiProperty({
    example: 'CAZ6UQX7...',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Milestone Index
  @ApiProperty({
    example: '1',
    description:
      'Position that identifies the milestone within the group of milestones in the escrow',
  })
  @IsString()
  milestoneIndex: string;

  // New Flag
  @ApiProperty({
    example: true,
    description: 'New value for the flag property within the escrow milestone',
  })
  @IsBoolean()
  newFlag: boolean;

  // Approver
  @ApiProperty({
    example: 'GCLIENT...XYZ',
    description: 'Address of the entity requiring the service',
  })
  @IsString()
  approver: string;
}

// Change Milestone Status
export class ChangeMilestoneStatus {
  // Contract ID
  @ApiProperty({
    example: 'CAZ6UQX7...',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Milestone Index
  @ApiProperty({
    example: '1',
    description: 'milestone within the group of milestones in the escrow',
  })
  @IsString()
  milestoneIndex: string;

  // New Status
  @ApiProperty({
    example: 'Completed',
    description:
      'New value for the status property within the escrow milestone',
  })
  @IsString()
  newStatus: string;

  // Service Provider
  @ApiProperty({
    example: 'Completed',
    description: 'Address of the entity providing the service',
  })
  @IsString()
  serviceProvider: string;
}

// Change Dispute Flag
export class ChangeDisputeFlag {
  // Contract ID
  @ApiProperty({
    example: 'CAZ6UQX7...',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Signer
  @ApiProperty({
    example: 'GSIGN...XYZ',
    description:
      'Entity that signs the transaction that deploys and initializes the escrow',
  })
  @IsString()
  signer: string;
}

// UpdateEscrowByContractID
class EscrowData {
  // Engagement ID
  @ApiProperty({
    example: 'ENG12345',
    description: 'Unique identifier for the escrow',
  })
  @IsString()
  engagementId: string;

  // Title
  @ApiProperty({ example: 'Test Title', description: 'Name of the escrow' })
  @IsString()
  title: string;

  // Description
  @ApiProperty({
    example: 'Escrow description',
    description: 'Text describing the function of the escrow',
  })
  @IsString()
  description: string;

  // Approver
  @ApiProperty({
    example: 'GAPPROVER...XYZ',
    description: 'Address of the entity requiring the service',
  })
  @IsString()
  approver: string;

  // Service Provider
  @ApiProperty({
    example: 'GSP...XYZ',
    description: 'Address of the entity providing the service',
  })
  @IsString()
  serviceProvider: string;

  // Platform Address
  @ApiProperty({
    example: 'GPLATFORM...XYZ',
    description: 'Address of the platform that owns the escrow',
  })
  @IsString()
  platformAddress: string;

  // Amount
  @ApiProperty({
    example: '1000',
    description:
      'Amount to be transferred upon completion of escrow milestones',
  })
  @IsString()
  amount: string;

  // Platform Fee
  @ApiProperty({
    example: '5',
    description:
      'Commission that the platform will receive when the escrow is completed',
  })
  @IsString()
  platformFee: string;

  // Milestones
  @ApiProperty({
    example: [],
    description: 'Objectives to be completed to define the escrow as completed',
  })
  milestones: [];

  // Release Signer
  @ApiProperty({
    example: 'GREL...XYZ',
    description:
      'Address of the user in charge of releasing the escrow funds to the service provider',
  })
  @IsString()
  releaseSigner: string;

  // Dispute Flag
  @ApiProperty({
    example: false,
    description: 'Flag indicating that an escrow is in dispute',
  })
  @IsBoolean()
  disputeFlag: boolean;

  // Release Flag
  @ApiProperty({
    example: true,
    description: 'Flag indicating that escrow funds have already been released',
  })
  @IsBoolean()
  releaseFlag: boolean;

  // Resolved Flag
  @ApiProperty({
    example: false,
    description:
      'Flag indicating that a disputed escrow has already been resolved',
  })
  @IsBoolean()
  resolvedFlag: boolean;

  // Dispute Resolver
  @ApiProperty({
    example: 'GDISPUTE...XYZ',
    description: 'Address in charge of resolving disputes within the escrow',
  })
  @IsString()
  disputeResolver: string;

  // Receiver
  @ApiProperty({
    example: 'GRECEIVER...XYZ',
    description:
      'Address of the user to whom the escrow funds will be destined to',
  })
  @IsString()
  receiver: string;

  // Receiver Memo
  @ApiProperty({
    example: 123456,
    description:
      "Field used to identify the recipient's address in transactions through an intermediary account. This value is included as a memo in the transaction and allows the funds to be correctly routed to the wallet of the specified recipient",
  })
  @IsNumber()
  receiverMemo: number;

  // Trustline
  @ApiProperty({
    example: 'GTRUST...XYZ',
    description: 'Address of the token that will manage USDC movements',
  })
  @IsString()
  trustline: string;

  // Trustline Decimals
  @ApiProperty({
    example: 6233233223,
    description:
      'Number of decimal places determining the divisibility of the token base unit (trustline)',
  })
  @IsNumber()
  trustlineDecimals: number;
}

export class UpdateEscrowByContractID {
  // Signer
  @ApiProperty({
    example: 'GSIGN...XYZ',
    description:
      'Entity that signs the transaction that deploys and initializes the escrow',
  })
  @IsString()
  signer: string;

  // Contract ID
  @ApiProperty({
    example: 'CAZ6UQX7...',
    description: 'ID (address) that identifies the escrow contract',
  })
  @IsString()
  contractId: string;

  // Escrow
  @ApiProperty({ type: EscrowData, description: 'Escrow data to update' })
  @ValidateNested()
  @Type(() => EscrowData)
  escrow: EscrowData;
}
