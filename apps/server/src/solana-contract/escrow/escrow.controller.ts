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
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import type {
  ApiResponse,
  EscrowCamelCaseResponse,
} from 'src/interfaces/response.interface';
import {
  ApiChangeDisputeFlagKey,
  ApiChangeMilestoneFlagKey,
  ApiChangeMilestoneStatusKey,
  ApiFundEscrow,
  ApiGetEscrowByEngagementIdEscrow,
  ApiResolvingDisputesEscrow,
  ApiUpdateEscrowByContractId,
} from 'src/swagger';
import {
  ChangeDisputeFlagDto,
  ChangeMilestoneFlagDto,
  ChangeMilestoneStatusDto,
  EscrowDisputeResolutionDto,
  EscrowOperationWithSignerDto,
  GetEscrowByEngagementIdDto,
  UpdateEscrowDTO,
} from './Dto/escrow.dto';
import { EscrowService } from './escrow.service';

@ApiTags('Escrow')
@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Post('fund-escrow')
  @ApiFundEscrow()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async fundEscrow(
    @Body() escrowOperationWithSignerDto: EscrowOperationWithSignerDto,
  ): Promise<ApiResponse> {
    const { contractId, signer, amount } = escrowOperationWithSignerDto;
    try {
      const result = await this.escrowService.fundEscrow(
        contractId,
        signer,
        amount,
      );
      return result;
    } catch (error) {
      if (error instanceof Error && error.message) {
        throw new HttpException(
          { status: HttpStatus.BAD_REQUEST, message: error.message },
          HttpStatus.BAD_REQUEST,
        );
      }

      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('release-funds')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async releaseFunds(
    @Body() body: { contractId: string; releaseSigner: string },
  ): Promise<ApiResponse> {
    const { contractId, releaseSigner } = body;
    try {
      return await this.escrowService.releaseFunds(contractId, releaseSigner);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('resolving-disputes')
  @ApiResolvingDisputesEscrow()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async resolvingDisputes(
    @Body() escrowDisputeResolutionDto: EscrowDisputeResolutionDto,
  ): Promise<ApiResponse> {
    const { contractId, disputeResolver, approverFunds, receiverFunds } =
      escrowDisputeResolutionDto;
    try {
      const result = await this.escrowService.resolveDispute(
        contractId,
        disputeResolver,
        approverFunds,
        receiverFunds,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('change-milestone-approved-flag')
  @UseGuards(AuthGuard())
  @ApiChangeMilestoneFlagKey()
  @ApiBearerAuth('jwt-auth')
  async changeMilestoneFlag(
    @Body() changeMilestoneFlagDto: ChangeMilestoneFlagDto,
  ): Promise<ApiResponse> {
    const { contractId, milestoneIndex, newFlag, approver } =
      changeMilestoneFlagDto;
    try {
      const result = await this.escrowService.changeMilestoneFlag(
        contractId,
        milestoneIndex,
        newFlag,
        approver,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('change-milestone-status')
  @UseGuards(AuthGuard())
  @ApiChangeMilestoneStatusKey()
  @ApiBearerAuth('jwt-auth')
  async changeMilestoneStatus(
    @Body() changeMilestoneStatusDto: ChangeMilestoneStatusDto,
  ): Promise<ApiResponse> {
    const {
      contractId,
      milestoneIndex,
      newStatus,
      newEvidence,
      serviceProvider,
    } = changeMilestoneStatusDto;
    try {
      const result = await this.escrowService.changeMilestoneStatus(
        contractId,
        milestoneIndex,
        newStatus,
        newEvidence,
        serviceProvider,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('change-dispute-flag')
  @UseGuards(AuthGuard())
  @ApiChangeDisputeFlagKey()
  @ApiBearerAuth('jwt-auth')
  async changeDisputeFlag(
    @Body() changeDisputeFlagDto: ChangeDisputeFlagDto,
  ): Promise<ApiResponse> {
    const { contractId, signer } = changeDisputeFlagDto;
    try {
      const result = await this.escrowService.changeDisputeFlag(
        contractId,
        signer,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put('update-escrow-by-contract-id')
  @UseGuards(AuthGuard())
  @ApiUpdateEscrowByContractId()
  @ApiBearerAuth('jwt-auth')
  async updateEscrowByContractID(
    @Body() updateEscrowDTO: UpdateEscrowDTO,
  ): Promise<ApiResponse> {
    const { contractId, signer, escrow } = updateEscrowDTO;
    try {
      const result = await this.escrowService.updateEscrowByContractID(
        contractId,
        signer,
        escrow,
      );
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('get-escrow-by-contract-id')
  @ApiGetEscrowByEngagementIdEscrow()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async getEscrowByContractId(
    @Query() getEscrowByEngagementIdDto: GetEscrowByEngagementIdDto,
  ): Promise<EscrowCamelCaseResponse | ApiResponse> {
    const { signer, contractId } = getEscrowByEngagementIdDto;
    try {
      const escrow = await this.escrowService.getEscrowByContractID(
        signer,
        contractId,
      );
      return escrow;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'An unexpected error occurred' },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
