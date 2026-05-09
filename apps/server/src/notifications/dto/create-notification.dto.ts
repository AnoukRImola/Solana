import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
	IsString,
	IsEnum,
	IsArray,
	IsOptional,
	IsObject,
} from 'class-validator'

export enum NotificationType {
	CONTRACT_CREATED = 'CONTRACT_CREATED',
	WORK_SUBMITTED = 'WORK_SUBMITTED',
	WORK_APPROVED = 'WORK_APPROVED',
	WORK_REJECTED = 'WORK_REJECTED',
	PAYMENT_RELEASED = 'PAYMENT_RELEASED',
	PAYMENT_RECEIVED = 'PAYMENT_RECEIVED',
	DISPUTE_OPENED = 'DISPUTE_OPENED',
	DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',
	CONTRACT_CANCELLED = 'CONTRACT_CANCELLED',
	DEADLINE_APPROACHING = 'DEADLINE_APPROACHING',
	MILESTONE_COMPLETED = 'MILESTONE_COMPLETED',
	SYSTEM_NOTIFICATION = 'SYSTEM_NOTIFICATION',
}

export class CreateNotificationDto {
	@ApiProperty({
		description: 'Contract ID associated with the notification',
		example: 'contract_123',
	})
	@IsString()
	contractId: string

	@ApiProperty({
		description: 'Type of notification',
		enum: NotificationType,
		example: NotificationType.CONTRACT_CREATED,
	})
	@IsEnum(NotificationType)
	type: NotificationType

	@ApiProperty({
		description: 'Notification title',
		example: 'New Contract Created',
	})
	@IsString()
	title: string

	@ApiProperty({
		description: 'Notification message body',
		example: 'A new contract has been created and requires your attention.',
	})
	@IsString()
	message: string

	@ApiProperty({
		description: 'Array of wallet addresses that should receive this notification',
		type: [String],
		example: ['wallet1', 'wallet2'],
	})
	@IsArray()
	@IsString({ each: true })
	entities: string[]

	@ApiPropertyOptional({
		description: 'Optional metadata for the notification',
		type: 'object',
		example: { amount: '100 USDC', deadline: '2024-12-31' },
	})
	@IsOptional()
	@IsObject()
	metadata?: Record<string, any>
}
