/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/escrow.json`.
 */
export type Escrow = {
	address: 'A2f8EQ1iYEFLkiN1UTDBkMYKR2Hxw7vqBb8srcVjGxk4'
	metadata: {
		name: 'escrow'
		version: '0.1.0'
		spec: '0.1.0'
		description: 'Created with Anchor'
	}
	instructions: [
		{
			name: 'changeDisputeFlag'
			discriminator: [146, 183, 127, 129, 72, 34, 38, 86]
			accounts: [
				{
					name: 'signer'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
			]
			args: []
		},
		{
			name: 'changeEscrowProperties'
			discriminator: [112, 69, 179, 207, 70, 12, 228, 63]
			accounts: [
				{
					name: 'platformSigner'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
				{
					name: 'escrowTokenAccount'
					writable: true
				},
			]
			args: [
				{
					name: 'newData'
					type: {
						defined: {
							name: 'escrowData'
						}
					}
				},
			]
		},
		{
			name: 'changeMilestoneFlag'
			discriminator: [20, 66, 188, 92, 137, 1, 81, 167]
			accounts: [
				{
					name: 'approver'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
			]
			args: [
				{
					name: 'milestoneIndex'
					type: 'i128'
				},
				{
					name: 'newFlag'
					type: 'bool'
				},
			]
		},
		{
			name: 'changeMilestoneStatus'
			discriminator: [26, 165, 198, 111, 126, 38, 15, 21]
			accounts: [
				{
					name: 'serviceProvider'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
			]
			args: [
				{
					name: 'milestoneIndex'
					type: 'i128'
				},
				{
					name: 'newStatus'
					type: 'string'
				},
				{
					name: 'newEvidence'
					type: {
						option: 'string'
					}
				},
			]
		},
		{
			name: 'fundEscrow'
			discriminator: [155, 18, 218, 141, 182, 213, 69, 201]
			accounts: [
				{
					name: 'signer'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
				{
					name: 'escrowTokenAccount'
					writable: true
				},
				{
					name: 'userTokenAccount'
					writable: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				},
			]
			args: [
				{
					name: 'amount'
					type: 'u64'
				},
				{
					name: 'bump'
					type: 'u8'
				},
			]
		},
		{
			name: 'getEscrow'
			discriminator: [237, 216, 159, 100, 172, 119, 114, 2]
			accounts: [
				{
					name: 'escrowAccount'
				},
			]
			args: []
			returns: {
				defined: {
					name: 'escrowData'
				}
			}
		},
		{
			name: 'initializeEscrow'
			discriminator: [243, 160, 77, 153, 11, 92, 48, 209]
			accounts: [
				{
					name: 'escrowAccount'
					writable: true
				},
				{
					name: 'initializer'
					writable: true
					signer: true
				},
				{
					name: 'systemProgram'
					address: '11111111111111111111111111111111'
				},
			]
			args: [
				{
					name: 'newEscrow'
					type: {
						defined: {
							name: 'escrowData'
						}
					}
				},
			]
			returns: {
				defined: {
					name: 'escrowData'
				}
			}
		},
		{
			name: 'releaseFunds'
			discriminator: [225, 88, 91, 108, 126, 52, 2, 26]
			accounts: [
				{
					name: 'releaseSigner'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
				{
					name: 'escrowAuthority'
				},
				{
					name: 'escrowTokenAccount'
					writable: true
				},
				{
					name: 'trustlessWorkAccount'
					writable: true
				},
				{
					name: 'platformAccount'
					writable: true
				},
				{
					name: 'receiverAccount'
					writable: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				},
			]
			args: [
				{
					name: 'escrowBump'
					type: 'u8'
				},
			]
		},
		{
			name: 'resolveDispute'
			discriminator: [231, 6, 202, 6, 96, 103, 12, 230]
			accounts: [
				{
					name: 'disputeResolver'
					writable: true
					signer: true
				},
				{
					name: 'escrowAccount'
					writable: true
				},
				{
					name: 'escrowAuthority'
				},
				{
					name: 'escrowTokenAccount'
					writable: true
				},
				{
					name: 'trustlessWorkAccount'
					writable: true
				},
				{
					name: 'platformAccount'
					writable: true
				},
				{
					name: 'approverAccount'
					writable: true
				},
				{
					name: 'serviceProviderAccount'
					writable: true
				},
				{
					name: 'tokenProgram'
					address: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'
				},
			]
			args: [
				{
					name: 'approverFunds'
					type: 'i128'
				},
				{
					name: 'providerFunds'
					type: 'i128'
				},
				{
					name: 'escrowBump'
					type: 'u8'
				},
			]
		},
	]
	accounts: [
		{
			name: 'escrowData'
			discriminator: [249, 142, 239, 239, 106, 183, 96, 92]
		},
	]
	events: [
		{
			name: 'escrowPublished'
			discriminator: [11, 75, 220, 177, 247, 252, 24, 182]
		},
	]
	errors: [
		{
			code: 6000
			name: 'escrowNotFunded'
			msg: 'Escrow not funded'
		},
		{
			code: 6001
			name: 'deserializationFailed'
			msg: 'Failed to deserialize escrow data.'
		},
		{
			code: 6002
			name: 'amountCannotBeZero'
			msg: 'Amount cannot be zero'
		},
		{
			code: 6003
			name: 'escrowAlreadyInitialized'
			msg: 'Escrow already initialized'
		},
		{
			code: 6004
			name: 'onlySignerCanFundEscrow'
			msg: 'Only the signer can fund the escrow'
		},
		{
			code: 6005
			name: 'escrowAlreadyFunded'
			msg: 'Escrow already funded'
		},
		{
			code: 6006
			name: 'escrowFullyFunded'
			msg: 'Escrow already fully funded'
		},
		{
			code: 6007
			name: 'signerInsufficientFunds'
			msg: 'Signer has insufficient funds'
		},
		{
			code: 6008
			name: 'notEnoughAllowance'
			msg: 'Not enough allowance to fund this escrow'
		},
		{
			code: 6009
			name: 'escrowAlreadyCompleted'
			msg: 'Escrow already completed'
		},
		{
			code: 6010
			name: 'signerInsufficientFundsToComplete'
			msg: 'Signer has insufficient funds to complete escrow'
		},
		{
			code: 6011
			name: 'onlySignerCanRequestRefund'
			msg: 'Only the signer can request a refund'
		},
		{
			code: 6012
			name: 'noFundsToRefund'
			msg: 'No funds available to refund'
		},
		{
			code: 6013
			name: 'contractHasInsufficientBalance'
			msg: 'Contract has no balance to repay'
		},
		{
			code: 6014
			name: 'escrowNotFound'
			msg: 'Escrow not found'
		},
		{
			code: 6015
			name: 'onlyReleaseSignerCanDistributeEarnings'
			msg: 'Only the release signer can distribute earnings'
		},
		{
			code: 6016
			name: 'escrowNotCompleted'
			msg: 'Escrow not completed'
		},
		{
			code: 6017
			name: 'escrowBalanceNotEnoughToSendEarnings'
			msg: 'Escrow balance insufficient for distribution'
		},
		{
			code: 6018
			name: 'contractInsufficientFunds'
			msg: 'Contract has insufficient funds'
		},
		{
			code: 6019
			name: 'onlyPlatformAddressExecuteThisFunction'
			msg: 'Only platform address may execute this function'
		},
		{
			code: 6020
			name: 'escrowNotInitialized'
			msg: 'Escrow not initialized'
		},
		{
			code: 6021
			name: 'onlyServiceProviderChangeMilstoneStatus'
			msg: 'Only the service provider can change milestone status'
		},
		{
			code: 6022
			name: 'noMileStoneDefined'
			msg: 'No milestones defined'
		},
		{
			code: 6023
			name: 'invalidMileStoneIndex'
			msg: 'Invalid milestone index'
		},
		{
			code: 6024
			name: 'onlyApproverChangeMilstoneFlag'
			msg: 'Only the approver can change milestone flag'
		},
		{
			code: 6025
			name: 'onlyDisputeResolverCanExecuteThisFunction'
			msg: 'Only the dispute resolver can execute this function'
		},
		{
			code: 6026
			name: 'escrowAlreadyInDispute'
			msg: 'Escrow already in dispute'
		},
		{
			code: 6027
			name: 'escrowNotInDispute'
			msg: 'Escrow not in dispute'
		},
		{
			code: 6028
			name: 'insufficientFundsForResolution'
			msg: 'Insufficient funds for resolution'
		},
		{
			code: 6029
			name: 'invalidState'
			msg: 'Invalid state'
		},
		{
			code: 6030
			name: 'escrowOpenedForDisputeResolution'
			msg: 'Escrow opened for dispute resolution'
		},
		{
			code: 6031
			name: 'amountToDepositGreatherThanEscrowAmount'
			msg: 'Amount to deposit is greater than escrow amount'
		},
		{
			code: 6032
			name: 'overflow'
			msg: 'Operation may cause overflow'
		},
		{
			code: 6033
			name: 'underflow'
			msg: 'Operation may cause underflow'
		},
		{
			code: 6034
			name: 'divisionError'
			msg: 'Operation may cause division error'
		},
		{
			code: 6035
			name: 'adminNotFound'
			msg: 'Admin not found'
		},
		{
			code: 6036
			name: 'insufficientApproverFundsForCommissions'
			msg: 'Insufficient approver funds for commissions'
		},
		{
			code: 6037
			name: 'insufficientServiceProviderFundsForCommissions'
			msg: 'Insufficient service provider funds for commissions'
		},
		{
			code: 6038
			name: 'milestoneApprovedCantChangeEscrowProperties'
			msg: "Milestone approved, can't change escrow properties"
		},
		{
			code: 6039
			name: 'escrowHasFunds'
			msg: 'Escrow has funds'
		},
		{
			code: 6040
			name: 'escrowAlreadyResolved'
			msg: 'Escrow already resolved'
		},
		{
			code: 6041
			name: 'tooManyEscrowsRequested'
			msg: 'Too many escrows requested'
		},
		{
			code: 6042
			name: 'unauthorizedToChangeDisputeFlag'
			msg: 'Unauthorized to change dispute flag'
		},
		{
			code: 6043
			name: 'argumentConversionFailed'
			msg: 'Argument conversion failed'
		},
		{
			code: 6044
			name: 'tooManyMilestones'
			msg: 'Too many milestones in escrow'
		},
		{
			code: 6045
			name: 'allowanceExpired'
			msg: 'Allowance has expired'
		},
		{
			code: 6046
			name: 'insufficientAllowance'
			msg: 'Insufficient allowance'
		},
		{
			code: 6047
			name: 'invalidExpirationSlot'
			msg: 'Invalid expiration slot'
		},
		{
			code: 6048
			name: 'decimalExceedsLimit'
			msg: 'Decimal must not be greater than 18'
		},
		{
			code: 6049
			name: 'unauthorized'
			msg: 'unauthorized'
		},
		{
			code: 6050
			name: 'invalidDecimals'
			msg: 'Invalid decimals'
		},
		{
			code: 6051
			name: 'alreadyInitialized'
			msg: 'Already initialized'
		},
	]
	types: [
		{
			name: 'escrowData'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'engagementId'
						type: 'string'
					},
					{
						name: 'title'
						type: 'string'
					},
					{
						name: 'description'
						type: 'string'
					},
					{
						name: 'amount'
						type: 'i128'
					},
					{
						name: 'platformFee'
						type: 'i128'
					},
					{
						name: 'milestones'
						type: {
							vec: {
								defined: {
									name: 'milestone'
								}
							}
						}
					},
					{
						name: 'flags'
						type: {
							defined: {
								name: 'flags'
							}
						}
					},
					{
						name: 'trustline'
						type: {
							defined: {
								name: 'trustline'
							}
						}
					},
					{
						name: 'receiverMemo'
						type: 'i128'
					},
					{
						name: 'roles'
						type: {
							defined: {
								name: 'roles'
							}
						}
					},
				]
			}
		},
		{
			name: 'escrowPublished'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'escrowId'
						type: 'string'
					},
					{
						name: 'escrowData'
						type: {
							defined: {
								name: 'escrowData'
							}
						}
					},
				]
			}
		},
		{
			name: 'flags'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'dispute'
						type: 'bool'
					},
					{
						name: 'release'
						type: 'bool'
					},
					{
						name: 'resolved'
						type: 'bool'
					},
				]
			}
		},
		{
			name: 'milestone'
			docs: ['Escrow State']
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'description'
						type: 'string'
					},
					{
						name: 'status'
						type: 'string'
					},
					{
						name: 'evidence'
						type: 'string'
					},
					{
						name: 'approvedFlag'
						type: 'bool'
					},
				]
			}
		},
		{
			name: 'roles'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'approver'
						type: 'pubkey'
					},
					{
						name: 'serviceProvider'
						type: 'pubkey'
					},
					{
						name: 'platformAddress'
						type: 'pubkey'
					},
					{
						name: 'releaseSigner'
						type: 'pubkey'
					},
					{
						name: 'disputeResolver'
						type: 'pubkey'
					},
					{
						name: 'receiver'
						type: 'pubkey'
					},
				]
			}
		},
		{
			name: 'trustline'
			type: {
				kind: 'struct'
				fields: [
					{
						name: 'address'
						type: 'pubkey'
					},
					{
						name: 'decimals'
						type: 'i128'
					},
				]
			}
		},
	]
}
