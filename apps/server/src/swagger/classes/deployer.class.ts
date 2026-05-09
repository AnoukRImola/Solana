import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';
import { Milestone } from 'src/interfaces/milestone.interface';

export class InvokeContract {
  // Signer
  @ApiProperty({
    example: 'GABC...XYZ',
    description:
      'Entity that signs the transaction that deploys and initializes the escrow',
  })
  @IsString()
  signer: string;

  // Engagement
  @ApiProperty({
    example: 'ENG12345',
    description: 'Unique identifier for the escrow',
  })
  @IsString()
  engagementId: string;

  // Title
  @ApiProperty({
    example: 'Escrow Test',
    description: 'Name of the escrow',
  })
  @IsString()
  title: string;

  // Description
  @ApiProperty({
    example: 'Escrow Test description',
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
    example: 'GSERVICE...XYZ',
    description: 'Address of the entity providing the service',
  })
  @IsString()
  serviceProvider: string;

  // Platform
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
    example: '5 -> 5%',
    description:
      'Commission that the platform will receive when the escrow is completed',
  })
  @IsString()
  platformFee: string;

  // Milestones
  @ApiProperty({
    type: [Object],
    description:
      'Objectives to be completed to define the escrow as completed.',
  })
  @IsArray()
  milestones: Milestone[];

  // Release Signer
  @ApiProperty({
    example: 'GREL...XYZ',
    description:
      'Address of the user in charge of releasing the escrow funds to the service provider',
  })
  @IsString()
  releaseSigner: string;

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
    required: false,
  })
  @IsNumber()
  @IsOptional()
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
    example: 68890890,
    description:
      'Number of decimal places determining the divisibility of the token base unit (trustline)',
  })
  @IsNumber()
  trustlineDecimals: number;
}
