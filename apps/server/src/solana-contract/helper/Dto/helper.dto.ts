import {
	IsArray,
	IsBoolean,
	IsNotEmpty,
	IsOptional,
	IsString,
} from 'class-validator'
import { IsAddressValid } from 'src/common/custom-validators'

export class SendTransactionDto {
	@IsNotEmpty({ message: 'The signedXdr must not be empty' })
	@IsString()
	signedXdr: string

	@IsNotEmpty({ message: 'The queueKey must not be empty' })
	@IsString()
	queueKey: string

	@IsBoolean()
	@IsOptional()
	returnEscrowDataIsRequired: boolean

	@IsBoolean()
	@IsOptional()
	saveInfo: boolean
}

export class SetTrustlineDto {
	@IsNotEmpty({ message: 'The sourceSecretKey must not be empty' })
	@IsString()
	sourceSecretKey: string
}

export class GetMultiSigEscrowBalanceDto {
	@IsNotEmpty({ message: 'The signer must not be empty' })
	@IsString()
	@IsAddressValid()
	signer: string

	@IsArray()
	@IsOptional()
	addresses: string[]
}
