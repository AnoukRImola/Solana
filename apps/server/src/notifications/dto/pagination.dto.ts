import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsInt, Min, Max, IsBoolean, IsEnum } from 'class-validator'
import { Type } from 'class-transformer'
import { NotificationType } from './create-notification.dto'

export class PaginationDto {
	@ApiPropertyOptional({
		description: 'Page number (starts at 1)',
		minimum: 1,
		default: 1,
		example: 1,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	page?: number = 1

	@ApiPropertyOptional({
		description: 'Number of items per page',
		minimum: 1,
		maximum: 100,
		default: 20,
		example: 20,
	})
	@IsOptional()
	@Type(() => Number)
	@IsInt()
	@Min(1)
	@Max(100)
	limit?: number = 20

	@ApiPropertyOptional({
		description: 'Filter by read status',
		example: false,
	})
	@IsOptional()
	@Type(() => Boolean)
	@IsBoolean()
	read?: boolean

	@ApiPropertyOptional({
		description: 'Filter by notification type',
		enum: NotificationType,
		example: NotificationType.CONTRACT_CREATED,
	})
	@IsOptional()
	@IsEnum(NotificationType)
	type?: NotificationType
}
