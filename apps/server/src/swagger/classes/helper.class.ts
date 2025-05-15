import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsString } from 'class-validator'

export class SetTrustline {
	// sourceSecretKey
	@ApiProperty({
		example: 'GABC...XYZ',
		description:
			'The key of the secret source account that will be used to set the trustline',
	})
	@IsString()
	sourceSecretKey: string
}

export class SendTransaction {
	// sourceSecretKey
	@ApiProperty({
		example: 'AAAAAgAAAAB...',
		description: "The sign's hash. This come from the wallet",
	})
	@IsString()
	signedXdr: string

	// returnEscrowDataIsRequired
	@ApiProperty({
		example: true,
		description:
			'If a return escrow data is needed (Note that not all contract functions return data from an escrow)',
	})
	@IsBoolean()
	returnEscrowDataIsRequired: boolean
}

// GetMultiSigEscrowBalance is not a class, because is a GET request. So we define the query params in the index.ts
