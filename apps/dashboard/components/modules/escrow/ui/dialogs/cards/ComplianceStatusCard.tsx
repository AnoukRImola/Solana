'use client'

import { CheckCircle, Globe, ShieldCheck, XCircle } from 'lucide-react'
import type { ComplianceData, EscrowComplianceData } from '~/@types/escrow.entity'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
import TooltipInfo from '~/components/utils/ui/Tooltip'
import { cn } from '~/lib/utils'

interface ComplianceStatusCardProps {
	compliance?: ComplianceData
	escrowCompliance?: EscrowComplianceData
	className?: string
}

export const ComplianceStatusCard = ({
	compliance,
	escrowCompliance,
	className,
}: ComplianceStatusCardProps) => {
	const isKycVerified = compliance?.kycVerified ?? false
	const hasTravelRule = !!escrowCompliance?.travelRule

	return (
		<Card
			className={cn(
				'overflow-hidden cursor-pointer hover:shadow-lg w-full md:w-2/5',
				className,
			)}
		>
			<CardContent className="p-6 min-h-36">
				<div className="flex items-center justify-between">
					<div className="flex">
						<p className="text-sm font-medium text-muted-foreground">
							Compliance
						</p>
						<TooltipInfo content="KYC/AML compliance status for this escrow." />
					</div>
					<ShieldCheck
						className={isKycVerified ? 'text-green-600' : 'text-muted-foreground'}
						size={30}
					/>
				</div>

				<div className="mt-2 flex flex-col gap-2">
					<div className="flex items-center gap-2">
						{isKycVerified ? (
							<CheckCircle className="text-green-600" size={16} />
						) : (
							<XCircle className="text-muted-foreground" size={16} />
						)}
						<span className="text-sm">
							KYC {isKycVerified ? 'Verified' : 'Not Verified'}
						</span>
						{isKycVerified && compliance?.kycProvider && (
							<Badge variant="secondary" className="text-xs">
								{compliance.kycProvider}
							</Badge>
						)}
					</div>

					{compliance?.jurisdiction && (
						<div className="flex items-center gap-2">
							<Globe className="text-muted-foreground" size={16} />
							<span className="text-sm">{compliance.jurisdiction}</span>
						</div>
					)}

					{compliance?.riskScore !== undefined && (
						<div className="flex items-center gap-2">
							<span className="text-sm text-muted-foreground">
								Risk Score:{' '}
							</span>
							<Badge
								variant={compliance.riskScore <= 30 ? 'secondary' : 'destructive'}
								className="text-xs"
							>
								{compliance.riskScore}/100
							</Badge>
						</div>
					)}

					<div className="flex items-center gap-2">
						{hasTravelRule ? (
							<CheckCircle className="text-green-600" size={16} />
						) : (
							<XCircle className="text-muted-foreground" size={16} />
						)}
						<span className="text-sm">
							Travel Rule {hasTravelRule ? 'Set' : 'Not Set'}
						</span>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
