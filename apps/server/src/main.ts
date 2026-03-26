import {
	BadRequestException,
	ValidationError,
	ValidationPipe,
} from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import * as dotenv from 'dotenv'
import { AppModule } from './app.module'

dotenv.config()

async function bootstrap() {
	const app = await NestFactory.create(AppModule)
	app.useGlobalPipes(
		new ValidationPipe({
			exceptionFactory: (errors: ValidationError[]) => {
				const formattedErrors = errors.reduce(
					(acc, err) => {
						acc[err.property] = Object.values(err.constraints ?? {})
						return acc
					},
					{} as Record<string, string[]>,
				)

				return new BadRequestException({
					statusCode: 400,
					error: 'Bad Request',
					message: 'Validation failed',
					details: formattedErrors,
				})
			},
		}),
	)

	// Enable CORS for all origins and methods
	app.enableCors({
		origin: true,
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		credentials: true,
	})

	// Set up JWT authentication
	const config = new DocumentBuilder()
		.setTitle('👋🏼  Welcome to Trustless Work API')
		.setDescription(
			'Trustless Work is an escrow-as-a-service platform built on Solana. It provides secure, transparent, and agile escrow solutions with compliance (KYC/AML/Travel Rule). See our [API Documentation](https://trustless-work.gitbook.io/trustless-work)',
		)
		.setVersion('1.0')
		.addBearerAuth(
			{
				type: 'http',
				scheme: 'bearer',
				bearerFormat: 'JWT',
			},
			'jwt-auth',
		)
		.build()

	// Set up Swagger
	const document = SwaggerModule.createDocument(app, config)
	SwaggerModule.setup('docs', app, document)

	// Set up swagger - open api file
	const openApiFile = new DocumentBuilder()
		.setTitle('Trustless Work API')
		.setDescription('Trustless Work API - OPEN API')
		.setVersion('1.0')
		.build()

	const openApiFileJSON = SwaggerModule.createDocument(app, openApiFile)
	SwaggerModule.setup('api', app, openApiFileJSON)

	await app.listen(process.env.PORT || 3000)

	console.log(`Now running in: ${process.env.PORT}` || 3000)
}
bootstrap()
