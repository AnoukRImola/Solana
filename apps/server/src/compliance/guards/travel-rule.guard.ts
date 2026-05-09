import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ComplianceService } from '../compliance.service';

@Injectable()
export class TravelRuleGuard implements CanActivate {
  constructor(private readonly complianceService: ComplianceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const { contractId, amount } = request.body;

    // Skip check if no amount is provided (non-financial operations)
    if (!contractId || !amount) {
      return true;
    }

    try {
      const registry = await this.complianceService.getComplianceRegistry();

      // If no registry exists, skip travel rule check (compliance not configured)
      if (!registry || !registry.isInitialized) {
        return true;
      }

      const threshold = Number(registry.travelRuleThreshold);
      const txAmount = Number(amount);

      if (txAmount <= threshold) {
        return true;
      }

      const compliance =
        await this.complianceService.getEscrowCompliance(contractId);

      if (!compliance?.travelRule) {
        throw new ForbiddenException(
          `Transaction amount ${txAmount} exceeds Travel Rule threshold ${threshold}. Travel Rule data is required.`,
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;
      // If compliance service fails (e.g. RPC error), allow but log
      console.error(
        'TravelRuleGuard: Error checking compliance, allowing request:',
        error.message,
      );
      return true;
    }
  }
}
