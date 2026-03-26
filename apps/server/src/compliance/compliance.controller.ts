import {
	Body,
	Controller,
	Get,
	HttpException,
	HttpStatus,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger'
import type { ApiResponse } from 'src/interfaces/response.interface'
import { ComplianceService } from './compliance.service'
import { KytService } from './services/kyt.service'
import { EscrowFirestoreService } from 'src/solana-contract/escrow/firestore-services/escrow-firestore.service'
import {
	InitializeComplianceRegistryDto,
	VerifyAddressDto,
	RevokeVerificationDto,
	SetEscrowComplianceDto,
	SetTravelRuleDataDto,
	GetVerificationDto,
	GetEscrowComplianceDto,
	GetEscrowsBySignerDto,
	GetEscrowsByRoleDto,
	GetEscrowsByEngagementDto,
} from './dto/compliance.dto'

@ApiTags('Compliance')
@Controller('compliance')
export class ComplianceController {
	constructor(
		private readonly complianceService: ComplianceService,
		private readonly kytService: KytService,
		private readonly escrowFirestoreService: EscrowFirestoreService,
	) {}

	// ============================
	// Compliance Registry
	// ============================

	@Post('initialize-registry')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async initializeRegistry(
		@Body() dto: InitializeComplianceRegistryDto,
	): Promise<ApiResponse> {
		try {
			return await this.complianceService.initializeComplianceRegistry(dto)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('registry')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getRegistry() {
		try {
			const registry = await this.complianceService.getComplianceRegistry()
			if (!registry) {
				throw new HttpException(
					{ status: HttpStatus.NOT_FOUND, message: 'Compliance registry not initialized' },
					HttpStatus.NOT_FOUND,
				)
			}
			return registry
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	// ============================
	// KYC Verification
	// ============================

	@Post('verify-address')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async verifyAddress(@Body() dto: VerifyAddressDto): Promise<ApiResponse> {
		try {
			const result = await this.complianceService.verifyAddress(dto)
			await this.kytService.logTransaction({
				wallet: dto.signer,
				action: 'VERIFY_ADDRESS',
				metadata: {
					address: dto.address,
					kycProvider: dto.kycProvider,
					jurisdiction: dto.jurisdiction,
					riskScore: dto.riskScore,
				},
			})
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('revoke-verification')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async revokeVerification(
		@Body() dto: RevokeVerificationDto,
	): Promise<ApiResponse> {
		try {
			const result = await this.complianceService.revokeVerification(dto)
			await this.kytService.logTransaction({
				wallet: dto.signer,
				action: 'REVOKE_VERIFICATION',
				metadata: { address: dto.address },
			})
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('verification')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getVerification(@Query() dto: GetVerificationDto) {
		try {
			const verification =
				await this.complianceService.getAddressVerification(dto.address)
			if (!verification) {
				throw new HttpException(
					{
						status: HttpStatus.NOT_FOUND,
						message: 'No KYC verification found for this address',
					},
					HttpStatus.NOT_FOUND,
				)
			}
			return verification
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	// ============================
	// Escrow Compliance
	// ============================

	@Post('set-escrow-compliance')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async setEscrowCompliance(
		@Body() dto: SetEscrowComplianceDto,
	): Promise<ApiResponse> {
		try {
			const result = await this.complianceService.setEscrowCompliance(dto)
			await this.kytService.logTransaction({
				wallet: dto.signer,
				action: 'SET_ESCROW_COMPLIANCE',
				contractId: dto.escrowAddress,
				metadata: { requiresKyc: dto.requiresKyc },
			})
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Post('set-travel-rule-data')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async setTravelRuleData(
		@Body() dto: SetTravelRuleDataDto,
	): Promise<ApiResponse> {
		try {
			const result = await this.complianceService.setTravelRuleData(dto)
			await this.kytService.logTransaction({
				wallet: dto.signer,
				action: 'SET_TRAVEL_RULE_DATA',
				contractId: dto.escrowAddress,
			})
			return result
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('escrow-compliance')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getEscrowCompliance(@Query() dto: GetEscrowComplianceDto) {
		try {
			const compliance = await this.complianceService.getEscrowCompliance(
				dto.escrowAddress,
			)
			if (!compliance) {
				throw new HttpException(
					{
						status: HttpStatus.NOT_FOUND,
						message: 'No compliance record found for this escrow',
					},
					HttpStatus.NOT_FOUND,
				)
			}
			return compliance
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	// ============================
	// KYT — Audit Logs
	// ============================

	@Get('audit-logs')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getAuditLogs(
		@Query('wallet') wallet: string,
		@Query('page') page?: string,
		@Query('limit') limit?: string,
	) {
		try {
			return await this.kytService.getAuditLogs(
				wallet,
				page ? Number(page) : 1,
				limit ? Number(limit) : 20,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('suspicious-activity')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async checkSuspiciousActivity(@Query('wallet') wallet: string) {
		try {
			return await this.kytService.detectSuspiciousActivity(wallet)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	// ============================
	// Escrow Indexation
	// ============================

	@Get('escrows/by-signer')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getEscrowsBySigner(@Query() dto: GetEscrowsBySignerDto) {
		try {
			return await this.escrowFirestoreService.getEscrowsBySigner(
				dto.signer,
				dto.page || 1,
				dto.limit || 10,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('escrows/by-role')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getEscrowsByRole(@Query() dto: GetEscrowsByRoleDto) {
		try {
			return await this.escrowFirestoreService.getEscrowsByRole(
				dto.role,
				dto.wallet,
				dto.page || 1,
				dto.limit || 10,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}

	@Get('escrows/by-engagement')
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async getEscrowsByEngagement(@Query() dto: GetEscrowsByEngagementDto) {
		try {
			return await this.escrowFirestoreService.getEscrowsByEngagementId(
				dto.engagementId,
			)
		} catch (error) {
			if (error instanceof HttpException) throw error
			throw new HttpException(
				{
					status: HttpStatus.INTERNAL_SERVER_ERROR,
					message: 'An unexpected error occurred',
				},
				HttpStatus.INTERNAL_SERVER_ERROR,
			)
		}
	}
}
