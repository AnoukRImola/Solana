import {
  Body,
  Controller,
  HttpException,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApiResponse } from 'src/interfaces/response.interface';
import { ApiInvokeContract } from 'src/swagger';
import {
  InvokeDeployerContractDto,
  InvokeMultiReleaseDeployerDto,
} from './Dto/deployer.dto';
import { DeployerService } from './deployer.service';

@ApiTags('Deployer')
@Controller('deployer')
export class DeployerController {
  constructor(private readonly deployerService: DeployerService) {}

  @Post('single-release')
  @ApiInvokeContract()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async invokeContract(
    @Body() invokeDeployerContractDto: InvokeDeployerContractDto,
  ): Promise<ApiResponse> {
    try {
      return await this.deployerService.invokeDeployerContract(
        invokeDeployerContractDto,
      );
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('multi-release')
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async invokeMultiReleaseContract(
    @Body() dto: InvokeMultiReleaseDeployerDto,
  ): Promise<ApiResponse> {
    try {
      return await this.deployerService.invokeMultiReleaseDeployerContract(dto);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          message: 'An unexpected error occurred',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
