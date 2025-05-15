import { IsNumber, IsOptional, IsString } from 'class-validator'

export class EscrowPayloadDto {
	@IsString()
	title: string

	@IsString()
	description: string

	@IsNumber()
	amount: number

	@IsOptional()
	@IsString()
	status?: string
}
