import {
	IsBoolean,
	IsNotEmpty,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
} from 'class-validator'
import { IsAddressValid, IsAmountValid } from 'src/common/custom-validators'
import type { Milestone } from 'src/interfaces/milestone.interface'

export class EscrowOperationWithSignerDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

	@IsNotEmpty({ message: 'The amount must not be empty' })
	@IsString()
	amount: string
}

export class EscrowOperationWithServiceProviderDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The engagementId must not be empty' })
	@IsString()
	engagementId: string

	@IsNotEmpty({ message: 'The serviceProvider must not be empty' })
	@IsString()
	@IsAddressValid()
	serviceProvider: string
}

export class DistributeEscrowEarningsDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The release signer must not be empty' })
	@IsString()
	@IsAddressValid()
	releaseSigner: string
}

export class GetEscrowByEngagementIdDto {
	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string
}

export class EscrowDisputeResolutionDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	disputeResolver: string

	@IsNotEmpty({ message: 'The approver funds must not be empty' })
	@IsString()
	approverFunds: string

	@IsNotEmpty({ message: 'The service provider funds must not be empty' })
	@IsString()
	receiverFunds: string
}

export class ChangeMilestoneStatusDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The milestone index must not be empty' })
	@IsString()
	milestoneIndex: string

	@IsNotEmpty({ message: 'The new status funds must not be empty' })
	@IsString()
	newStatus: string

	@IsOptional()
	@IsString()
	newEvidence?: string

	@IsNotEmpty({ message: 'The service provider address must not be empty' })
	@IsString()
	@IsAddressValid()
	serviceProvider: string
}

export class ChangeMilestoneFlagDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The milestone index must not be empty' })
	@IsString()
	milestoneIndex: string

	@IsNotEmpty({ message: 'The new flag must not be empty' })
	@IsBoolean()
	newFlag: boolean

	@IsNotEmpty({ message: 'The approver address must not be empty' })
	@IsString()
	@IsAddressValid()
	approver: string
}

export class ChangeDisputeFlagDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string
}

export class EscrowDto {
	@IsNotEmpty({ message: 'The engagementId must not be empty' })
	@IsString()
	engagementId: string

	@IsNotEmpty({ message: 'The title must not be empty' })
	@IsString()
	title: string

	@IsNotEmpty({ message: 'The description must not be empty' })
	@IsString()
	description: string

	@IsNotEmpty({ message: 'The approver must not be empty' })
	@IsString()
	@IsAddressValid()
	approver: string

	@IsNotEmpty({ message: 'The serviceProvider must not be empty' })
	@IsString()
	@IsAddressValid()
	serviceProvider: string

	@IsNotEmpty({ message: 'The platformAddress must not be empty' })
	@IsString()
	@IsAddressValid()
	platformAddress: string

	@IsNotEmpty({ message: 'The amount must not be empty' })
	@IsString()
	@IsAmountValid()
	amount: string

	@IsNotEmpty({ message: 'The platformFee must not be empty' })
	@IsString()
	@IsAmountValid()
	platformFee: string

	@IsNotEmpty({ message: 'The milestones must not be empty' })
	milestones: Milestone[]

	@IsNotEmpty({ message: 'The releaseSigner must not be empty' })
	@IsString()
	@IsAddressValid()
	releaseSigner: string

	@IsNotEmpty({ message: 'The disputeResolver must not be empty' })
	@IsString()
	@IsAddressValid()
	disputeResolver: string

	@IsNotEmpty({ message: 'The trustline must not be empty' })
	@IsString()
	@IsAddressValid()
	trustline: string

	@IsNotEmpty({ message: 'The trustline decimals must not be empty' })
	@IsNumber()
	trustlineDecimals: number

	@IsNotEmpty({ message: 'The receiver must not be empty' })
	@IsString()
	@IsAddressValid()
	receiver: string

	@IsNotEmpty({ message: 'The receiver memo must not be empty' })
	@IsNumber()
	receiverMemo: number
}

export class UpdateEscrowDTO {
	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The escrow data must not be empty' })
	escrow: EscrowDto
}

// ============================
// Multi-Release DTOs
// ============================

export class MultiReleaseEscrowOperationDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

	@IsNotEmpty({ message: 'The amount must not be empty' })
	@IsString()
	amount: string
}

export class MultiReleaseMilestoneOperationDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The milestone index must not be empty' })
	@IsString()
	milestoneIndex: string

	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string
}

export class MultiReleaseMilestoneStatusDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The milestone index must not be empty' })
	@IsString()
	milestoneIndex: string

	@IsNotEmpty({ message: 'The new status must not be empty' })
	@IsString()
	newStatus: string

	@IsOptional()
	@IsString()
	newEvidence?: string

	@IsNotEmpty({ message: 'The service provider must not be empty' })
	@IsString()
	@IsAddressValid()
	serviceProvider: string
}

export class MultiReleaseMilestoneApproveDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The milestone index must not be empty' })
	@IsString()
	milestoneIndex: string

	@IsNotEmpty({ message: 'The approved flag must not be empty' })
	@IsBoolean()
	approved: boolean

	@IsNotEmpty({ message: 'The approver must not be empty' })
	@IsString()
	@IsAddressValid()
	approver: string
}

export class MultiReleaseDisputeResolutionDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The milestone index must not be empty' })
	@IsString()
	milestoneIndex: string

	@IsNotEmpty({ message: 'The dispute resolver must not be empty' })
	@IsString()
	@IsAddressValid()
	disputeResolver: string

	@IsNotEmpty({ message: 'The approver funds must not be empty' })
	@IsString()
	approverFunds: string

	@IsNotEmpty({ message: 'The receiver funds must not be empty' })
	@IsString()
	receiverFunds: string
}

export class WithdrawRemainingFundsDto {
	@IsNotEmpty({ message: 'The contractId must not be empty' })
	@IsString()
	@IsAddressValid()
	contractId: string

	@IsNotEmpty({ message: 'The approver must not be empty' })
	@IsString()
	@IsAddressValid()
	approver: string
}
