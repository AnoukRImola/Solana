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
import { ApiResponse } from 'src/interfaces/response.interface'
import {
	ApiGetMultiSigEscrowBalance,
	ApiSendTransaction,
	ApiSetTrustline,
} from 'src/swagger'
import {
	GetMultiSigEscrowBalanceDto,
	SendTransactionDto,
	SetTrustlineDto,
} from './Dto/helper.dto'
import { HelperService } from './helper.service'

@ApiTags('Helper')
@Controller('helper')
export class HelperController {
	constructor(private readonly helperService: HelperService) {}

	@Post('send-transaction')
	@ApiSendTransaction()
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async sendTransaction(
		@Body() sendTransactionDto: SendTransactionDto,
	): Promise<ApiResponse> {
		const { signedXdr, queueKey, returnEscrowDataIsRequired, saveInfo } =
			sendTransactionDto
		try {
			return await this.helperService.sendTransaction(
				signedXdr,
				queueKey,
				returnEscrowDataIsRequired,
				saveInfo,
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

	@Get('get-multiple-escrow-balance')
	@UseGuards(AuthGuard())
	@ApiGetMultiSigEscrowBalance()
	@ApiBearerAuth('jwt-auth')
	async getMultipleEscrowBalance(
		@Query() query: GetMultiSigEscrowBalanceDto,
	): Promise<{ address: string; balance: number }[] | void> {
		const { addresses, signer } = query
		try {
			if (!addresses || addresses.length === 0) {
				return []
			}
			return await this.helperService.getMultipleEscrowBalance(
				signer,
				addresses,
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

	@Post('set-trustline')
	@ApiSetTrustline()
	@UseGuards(AuthGuard())
	@ApiBearerAuth('jwt-auth')
	async setTrustline(
		@Body() setTrustlineDto: SetTrustlineDto,
	): Promise<ApiResponse> {
		const { walletAddress } = setTrustlineDto
		try {
			return await this.helperService.establishTrustline(walletAddress)
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
