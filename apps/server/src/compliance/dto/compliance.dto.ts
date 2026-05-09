import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

export class TravelRuleDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originatorName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originatorAccount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  originatorJurisdiction: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  beneficiaryName: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  beneficiaryAccount: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  beneficiaryJurisdiction: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  transferPurpose: string;
}

export class InitializeComplianceRegistryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  travelRuleThreshold: string;
}

export class VerifyAddressDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  kycProvider: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  jurisdiction: string;

  @ApiProperty()
  @IsNumber()
  @Min(0)
  @Max(100)
  riskScore: number;
}

export class RevokeVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signer: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class SetEscrowComplianceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signer: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  escrowAddress: string;

  @ApiProperty()
  @IsBoolean()
  requiresKyc: boolean;
}

export class SetTravelRuleDataDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signer: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  escrowAddress: string;

  @ApiProperty({ type: TravelRuleDataDto })
  @ValidateNested()
  @Type(() => TravelRuleDataDto)
  travelRuleData: TravelRuleDataDto;
}

export class GetVerificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  address: string;
}

export class GetEscrowComplianceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  escrowAddress: string;
}

export class GetEscrowsBySignerDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  signer: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class GetEscrowsByRoleDto {
  @ApiProperty({
    enum: [
      'approver',
      'serviceProvider',
      'receiver',
      'releaseSigner',
      'disputeResolver',
      'platformAddress',
    ],
  })
  @IsString()
  @IsNotEmpty()
  role: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  wallet: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number;
}

export class GetEscrowsByEngagementDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  engagementId: string;
}
