import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from '@nestjs/common'
import { ComplianceService } from '../compliance.service'

@Injectable()
export class TravelRuleGuard implements CanActivate {
	constructor(private readonly complianceService: ComplianceService) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const { contractId, amount } = request.body

		if (!contractId || !amount) {
			return true
		}

		const registry = await this.complianceService.getComplianceRegistry()

		if (!registry || !registry.isInitialized) {
			return true
		}

		const threshold = Number(registry.travelRuleThreshold)
		const txAmount = Number(amount)

		if (txAmount <= threshold) {
			return true
		}

		const compliance =
			await this.complianceService.getEscrowCompliance(contractId)

		if (!compliance?.travelRule) {
			throw new ForbiddenException(
				`Transaction amount ${txAmount} exceeds Travel Rule threshold ${threshold}. Travel Rule data is required.`,
			)
		}

		return true
	}
}
