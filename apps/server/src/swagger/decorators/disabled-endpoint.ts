import {
	HttpException,
	HttpStatus,
	UseInterceptors,
	applyDecorators,
} from '@nestjs/common'
import { ApiOperation } from '@nestjs/swagger'

export const DisabledEndpoint = () => {
	return applyDecorators(
		ApiOperation({
			summary: 'Disabled ⚠️',
			description: 'This Endpoint is disabled',
		}),
		UseInterceptors({
			intercept: () => {
				throw new HttpException(
					'Este endpoint está deshabilitado',
					HttpStatus.NOT_IMPLEMENTED,
				)
			},
		}),
	)
}
