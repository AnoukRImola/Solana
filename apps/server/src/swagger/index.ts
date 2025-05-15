import { applyDecorators } from '@nestjs/common'
import {
	ApiBadRequestResponse,
	ApiBody,
	ApiCreatedResponse,
	ApiResponse,
} from '@nestjs/swagger'
import { ApiQuery } from '@nestjs/swagger'
import { InvokeContract } from './classes/deployer.class'
import {
	ChangeDisputeFlag,
	ChangeMilestoneFlag,
	ChangeMilestoneStatus,
	DistributeEscrowEarnings,
	FundEscrow,
	ResolvingDisputesType,
	UpdateEscrowByContractID,
} from './classes/escrow.class'
import { SendTransaction, SetTrustline } from './classes/helper.class'
import { InvokeContractDefaultValue } from './default-values-in-body/deployer-default-value'
import {
	ChangeDisputeFlagDefaultValue,
	ChangeMilestoneFlagDefaultValue,
	ChangeMilestoneStatusDefaultValue,
	DistributeEscrowEarningsDefaultValue,
	FundEscrowDefaultValue,
	ResolvingDisputesDefaultValue,
	UpdateEscrowByContractIDDefaultValue,
} from './default-values-in-body/escrow-default-value'
import {
	SendTransactionDefaultValue,
	SetTrustlineDefaultValue,
} from './default-values-in-body/helper-default-value'

/**
 * Deployer
 */
export const ApiInvokeContract = () => {
	return applyDecorators(
		ApiBody({ type: InvokeContract, examples: InvokeContractDefaultValue }),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

/**
 * Escrows
 */
export const ApiFundEscrow = () => {
	return applyDecorators(
		ApiBody({ type: FundEscrow, examples: FundEscrowDefaultValue }),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiDistributeEscrowEarnings = () => {
	return applyDecorators(
		ApiBody({
			type: DistributeEscrowEarnings,
			examples: DistributeEscrowEarningsDefaultValue,
		}),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiResolvingDisputesEscrow = () => {
	return applyDecorators(
		ApiBody({
			type: ResolvingDisputesType,
			examples: ResolvingDisputesDefaultValue,
		}),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiChangeMilestoneFlagKey = () => {
	return applyDecorators(
		ApiBody({
			type: ChangeMilestoneFlag,
			examples: ChangeMilestoneFlagDefaultValue,
		}),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiChangeDisputeFlagKey = () => {
	return applyDecorators(
		ApiBody({
			type: ChangeDisputeFlag,
			examples: ChangeDisputeFlagDefaultValue,
		}),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiChangeMilestoneStatusKey = () => {
	return applyDecorators(
		ApiBody({
			type: ChangeMilestoneStatus,
			examples: ChangeMilestoneStatusDefaultValue,
		}),
		ApiCreatedResponse({
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiGetEscrowByEngagementIdEscrow = () => {
	return applyDecorators(
		ApiQuery({
			name: 'contractId',
			required: true,
			description: 'ID (address) that identifies the escrow contract',
			example: 'CAZ6UQX7...',
			type: String,
		}),
		ApiQuery({
			name: 'signer',
			required: true,
			description: 'Address of the user signing the contract transaction',
			example: 'GSIGN...XYZ',
			type: String,
		}),
		ApiResponse({
			status: 200,
			description: 'Escrow Body...',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiUpdateEscrowByContractId = () => {
	return applyDecorators(
		ApiBody({
			type: UpdateEscrowByContractID,
			examples: UpdateEscrowByContractIDDefaultValue,
		}),
		ApiResponse({
			status: 200,
			description:
				'This endpoint returns an unsigned transaction in XDR format. This XDR is then used to sign the transaction using the “/helper/send-transaction” endpoint.',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

/**
 * Helpers
 */
export const ApiSendTransaction = () => {
	return applyDecorators(
		ApiBody({
			type: SendTransaction,
			examples: SendTransactionDefaultValue,
		}),
		ApiResponse({
			status: 200,
			description:
				'The transaction has been successfully sent to the Stellar network',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiSetTrustline = () => {
	return applyDecorators(
		ApiBody({
			type: SetTrustline,
			examples: SetTrustlineDefaultValue,
		}),
		ApiResponse({
			status: 200,
			description:
				'The trust line has been correctly defined in the USDC token',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}

export const ApiGetMultiSigEscrowBalance = () => {
	return applyDecorators(
		ApiQuery({
			name: 'signer',
			type: String,
			required: true,
			description: 'Signer of the transaction',
		}),
		ApiQuery({
			name: 'addresses',
			type: [String],
			required: true,
			description: 'Array of addresses to query balances for',
			isArray: true,
		}),
		ApiResponse({
			status: 200,
			description:
				'The transaction has been successfully sent to the Stellar network',
		}),
		ApiBadRequestResponse({
			description: 'Bad request',
		}),
		ApiResponse({
			status: 429,
			description: 'Too Many Requests',
		}),
		ApiResponse({
			status: 401,
			description: 'Unauthorized access',
		}),
		ApiResponse({
			status: 500,
			description: `
      <p>Possible errors:</p>
      <ul>
        <li><strong>DatabaseError</strong>: Failed to connect to the database</li>
        <li><strong>InternalServerError</strong>: An unexpected error occurred</li>
        <li><strong>ProviderUnavailable</strong>: Provider connection lost</li>
      </ul>`,
		}),
	)
}
