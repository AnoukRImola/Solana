import {
	IsArray,
	IsNotEmpty,
	IsNumber,
	IsString,
	ValidateNested,
} from 'class-validator'
import { Type } from 'class-transformer'
import { IsAddressValid, IsAmountValid } from 'src/common/custom-validators'
import { Milestone } from 'src/interfaces/milestone.interface'

export class InvokeDeployerContractDto {
	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

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

export class MultiReleaseMilestoneDto {
	@IsNotEmpty()
	@IsString()
	description: string

	@IsNotEmpty()
	@IsString()
	@IsAmountValid()
	amount: string

	@IsNotEmpty()
	@IsString()
	@IsAddressValid()
	receiver: string
}

export class InvokeMultiReleaseDeployerDto {
	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

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

	@IsNotEmpty({ message: 'The platformFee must not be empty' })
	@IsString()
	@IsAmountValid()
	platformFee: string

	@IsNotEmpty({ message: 'The milestones must not be empty' })
	@IsArray()
	@ValidateNested({ each: true })
	@Type(() => MultiReleaseMilestoneDto)
	milestones: MultiReleaseMilestoneDto[]

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
}
