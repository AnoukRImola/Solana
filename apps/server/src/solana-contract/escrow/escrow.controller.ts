import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Put,
	Query,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import type {
	ApiResponse,
	EscrowCamelCaseResponse,
} from 'src/interfaces/response.interface'
import {
	ApiChangeDisputeFlagKey,
	ApiChangeMilestoneFlagKey,
	ApiChangeMilestoneStatusKey,
	ApiFundEscrow,
	ApiGetEscrowByEngagementIdEscrow,
	ApiResolvingDisputesEscrow,
	ApiUpdateEscrowByContractId,
} from 'src/swagger'
import {
	ChangeDisputeFlagDto,
	ChangeMilestoneFlagDto,
	ChangeMilestoneStatusDto,
	DistributeEscrowEarningsDto,
	EscrowDisputeResolutionDto,
	EscrowOperationWithSignerDto,
	GetEscrowByEngagementIdDto,
	MultiReleaseEscrowOperationDto,
	MultiReleaseMilestoneApproveDto,
	MultiReleaseMilestoneOperationDto,
	MultiReleaseMilestoneStatusDto,
	MultiReleaseDisputeResolutionDto,
	WithdrawRemainingFundsDto,
	UpdateEscrowDTO,
} from './Dto/escrow.dto'
import { EscrowService } from './escrow.service'

@ApiTags('Escrow')
@Controller('escrow')
export class EscrowController {
	constructor(private readonly escrowService: EscrowService) {}

	// ============================
	// Single-Release Endpoints
	// ============================

	@Post('fund-escrow')
	@ApiFundEscrow()
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async fundEscrow(
		@Body() dto: EscrowOperationWithSignerDto,
	): Promise<ApiResponse> {
		const { contractId, signer, amount } = dto
		try {
			return await this.escrowService.fundEscrow(contractId, signer, amount)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('release-funds')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async releaseFunds(
		@Body() dto: DistributeEscrowEarningsDto,
	): Promise<ApiResponse> {
		const { contractId, releaseSigner } = dto
		try {
			return await this.escrowService.releaseFunds(contractId, releaseSigner)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('resolving-disputes')
	@ApiResolvingDisputesEscrow()
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async resolvingDisputes(
		@Body() dto: EscrowDisputeResolutionDto,
	): Promise<ApiResponse> {
		const { contractId, disputeResolver, approverFunds, receiverFunds } = dto
		try {
			return await this.escrowService.resolveDispute(
				contractId,
				disputeResolver,
				approverFunds,
				receiverFunds,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('change-milestone-approved-flag')
	@UseGuards(AuthGuard())
	@ApiChangeMilestoneFlagKey()
	@ApiBearerAuth('jwt-auth')
	async changeMilestoneFlag(
		@Body() dto: ChangeMilestoneFlagDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, newFlag, approver } = dto
		try {
			return await this.escrowService.changeMilestoneFlag(
				contractId,
				milestoneIndex,
				newFlag,
				approver,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('change-milestone-status')
	@UseGuards(AuthGuard())
	@ApiChangeMilestoneStatusKey()
	@ApiBearerAuth('jwt-auth')
	async changeMilestoneStatus(
		@Body() dto: ChangeMilestoneStatusDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, newStatus, newEvidence, serviceProvider } = dto
		try {
			return await this.escrowService.changeMilestoneStatus(
				contractId,
				milestoneIndex,
				newStatus,
				newEvidence,
				serviceProvider,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('change-dispute-flag')
	@UseGuards(AuthGuard())
	@ApiChangeDisputeFlagKey()
	@ApiBearerAuth('jwt-auth')
	async changeDisputeFlag(
		@Body() dto: ChangeDisputeFlagDto,
	): Promise<ApiResponse> {
		const { contractId, signer } = dto
		try {
			return await this.escrowService.changeDisputeFlag(contractId, signer)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Put('update-escrow-by-contract-id')
	@UseGuards(AuthGuard())
	@ApiUpdateEscrowByContractId()
	@ApiBearerAuth('jwt-auth')
	async updateEscrowByContractID(
		@Body() dto: UpdateEscrowDTO,
	): Promise<ApiResponse> {
		const { contractId, signer, escrow } = dto
		try {
			return await this.escrowService.updateEscrowByContractID(
				contractId,
				signer,
				escrow,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('get-escrow-by-contract-id')
	@ApiGetEscrowByEngagementIdEscrow()
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getEscrowByContractId(
		@Query() dto: GetEscrowByEngagementIdDto,
	): Promise<EscrowCamelCaseResponse | ApiResponse> {
		const { signer, contractId } = dto
		try {
			return await this.escrowService.getEscrowByContractID(signer, contractId)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	// ============================
	// Multi-Release Endpoints
	// ============================

	@Post('multi-release/fund-escrow')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async fundMultiReleaseEscrow(
		@Body() dto: MultiReleaseEscrowOperationDto,
	): Promise<ApiResponse> {
		const { contractId, signer, amount } = dto
		try {
			return await this.escrowService.fundMultiReleaseEscrow(
				contractId,
				signer,
				amount,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('multi-release/change-milestone-status')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async changeMultiReleaseMilestoneStatus(
		@Body() dto: MultiReleaseMilestoneStatusDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, newStatus, newEvidence, serviceProvider } = dto
		try {
			return await this.escrowService.changeMultiReleaseMilestoneStatus(
				contractId,
				milestoneIndex,
				newStatus,
				newEvidence,
				serviceProvider,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('multi-release/approve-milestone')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async approveMultiReleaseMilestone(
		@Body() dto: MultiReleaseMilestoneApproveDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, approved, approver } = dto
		try {
			return await this.escrowService.approveMultiReleaseMilestone(
				contractId,
				milestoneIndex,
				approved,
				approver,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('multi-release/release-milestone-funds')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async releaseMilestoneFunds(
		@Body() dto: MultiReleaseMilestoneOperationDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, signer } = dto
		try {
			return await this.escrowService.releaseMilestoneFunds(
				contractId,
				milestoneIndex,
				signer,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('multi-release/dispute-milestone')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async disputeMilestone(
		@Body() dto: MultiReleaseMilestoneOperationDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, signer } = dto
		try {
			return await this.escrowService.disputeMilestone(
				contractId,
				milestoneIndex,
				signer,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('multi-release/resolve-milestone-dispute')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async resolveMilestoneDispute(
		@Body() dto: MultiReleaseDisputeResolutionDto,
	): Promise<ApiResponse> {
		const { contractId, milestoneIndex, disputeResolver, approverFunds, receiverFunds } = dto
		try {
			return await this.escrowService.resolveMilestoneDispute(
				contractId,
				milestoneIndex,
				disputeResolver,
				approverFunds,
				receiverFunds,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('multi-release/withdraw-remaining-funds')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async withdrawRemainingFunds(
		@Body() dto: WithdrawRemainingFundsDto,
	): Promise<ApiResponse> {
		const { contractId, approver } = dto
		try {
			return await this.escrowService.withdrawRemainingFunds(
				contractId,
				approver,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{ status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}
}
