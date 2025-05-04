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
import { InvokeDeployerContractDto } from './Dto/deployer.dto';
import { DeployerService } from './deployer.service';

@ApiTags('Deployer')
@Controller('deployer')
export class DeployerController {
  constructor(private readonly deployerService: DeployerService) {}

  @Post('invoke-deployer-contract')
  @ApiInvokeContract()
  @UseGuards(AuthGuard())
  @ApiBearerAuth('jwt-auth')
  async invokeContract(
    @Body() invokeDeployerContractDto: InvokeDeployerContractDto,
  ): Promise<ApiResponse> {
    try {
      const result = await this.deployerService.invokeDeployerContract(
        invokeDeployerContractDto,
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
}
