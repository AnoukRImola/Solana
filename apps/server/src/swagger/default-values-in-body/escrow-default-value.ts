export const FundEscrowDefaultValue = {
	default: {
		value: {
			contractId: 'CAZ6UQX7...',
			signer: 'GAPPROVER1234567890...',
			amount: '10',
		},
	},
}

export const CancelEscrowDefaultValue = {
	default: {
		value: {
			engagementId: 'ENG12345',
			signer: 'GAPPROVER1234567890...',
			contractId: 'CAZ6UQX7...',
		},
	},
}

export const ResolvingDisputesDefaultValue = {
	default: {
		value: {
			contractId: 'CAZ6UQX7...',
			disputeResolver: 'GAPPROVER1234567890...',
			approverFunds: '20',
			receiverFunds: '30',
		},
	},
}

export const DistributeEscrowEarningsDefaultValue = {
	default: {
		value: {
			contractId: 'CAZ6UQX7...',
			releaseSigner: 'GAPPROVER1234567890...',
		},
	},
}

export const ChangeMilestoneFlagDefaultValue = {
	default: {
		value: {
			contractId: 'CAZ6UQX7...',
			milestoneIndex: '1',
			newFlag: false,
			approver: 'GAPPROVER1234567890...',
		},
	},
}

export const ChangeMilestoneStatusDefaultValue = {
	default: {
		value: {
			contractId: 'CAZ6UQX7...',
			milestoneIndex: '1',
			newStatus: 'Completed',
			serviceProvider: 'GAPPROVER1234567890...',
		},
	},
}

export const ChangeDisputeFlagDefaultValue = {
	default: {
		value: {
			contractId: 'CAZ6UQX7...',
			signer: 'GAPPROVER1234567890...',
		},
	},
}

export const UpdateEscrowByContractIDDefaultValue = {
	default: {
		value: {
			signer: 'GAPPROVER1234567890...',
			contractId: 'CAZ6UQX7...',
			escrow: {
				signer: 'GAPPROVER1234567890...',
				engagementId: 'ENG12345',
				title: 'Project Title',
				description: 'This is a detailed description of the project.',
				approver: 'GAPPROVER1234567890...',
				serviceProvider: 'GAPPROVER1234567890...',
				platformAddress: 'GAPPROVER1234567890...',
				amount: '1000',
				platformFee: '50',
				milestones: [
					{
						description: 'test1',
						status: 'pending',
					},
					{
						description: 'test2',
						status: 'pending',
					},
				],
				disputeFlag: false,
				releaseFlag: true,
				resolvedFlag: false,
				releaseSigner: 'GAPPROVER1234567890...',
				disputeResolver: 'GAPPROVER1234567890...',
				receiver: 'GAPPROVER1234567890...',
				receiverMemo: 456789,
				trustline: 'GAPPROVER1234567890...',
				trustlineDecimals: 6233233223,
			},
		},
	},
}
