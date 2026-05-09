import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ComplianceService } from '../compliance.service';

@Injectable()
export class KycGuard implements CanActivate {
  constructor(private readonly complianceService: ComplianceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const wallet =
      request.body?.signer ||
      request.body?.approver ||
      request.body?.releaseSigner ||
      request.body?.disputeResolver ||
      request.body?.serviceProvider;

    if (!wallet) {
      throw new ForbiddenException('No wallet address found in request');
    }

    try {
      const isVerified = await this.complianceService.isAddressVerified(wallet);

      if (!isVerified) {
        throw new ForbiddenException(
          `Wallet ${wallet} has not passed KYC verification`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      // If compliance service fails (e.g. RPC error), allow but log
      console.error(
        'KycGuard: Error checking KYC status, allowing request:',
        error.message,
      );
      return true;
    }
  }
}
