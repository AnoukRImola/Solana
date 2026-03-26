import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Escrow Controller (e2e)', () => {
	let app: INestApplication

	beforeAll(async () => {
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile()

		app = moduleFixture.createNestApplication()
		app.useGlobalPipes(new ValidationPipe())
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	// ============================
	// Unauthorized Access Tests
	// ============================

	describe('Unauthorized access — Single Release', () => {
		it('POST /escrow/fund-escrow should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/fund-escrow')
				.send({ contractId: 'test', signer: 'test', amount: '100' })
				.expect(401)
		})

		it('POST /escrow/release-funds should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/release-funds')
				.send({ contractId: 'test', releaseSigner: 'test' })
				.expect(401)
		})

		it('POST /escrow/resolving-disputes should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/resolving-disputes')
				.send({
					contractId: 'test',
					disputeResolver: 'test',
					approverFunds: '50',
					receiverFunds: '50',
				})
				.expect(401)
		})

		it('POST /escrow/change-milestone-approved-flag should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/change-milestone-approved-flag')
				.send({
					contractId: 'test',
					milestoneIndex: '0',
					newFlag: true,
					approver: 'test',
				})
				.expect(401)
		})

		it('POST /escrow/change-milestone-status should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/change-milestone-status')
				.send({
					contractId: 'test',
					milestoneIndex: '0',
					newStatus: 'completed',
					serviceProvider: 'test',
				})
				.expect(401)
		})

		it('POST /escrow/change-dispute-flag should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/change-dispute-flag')
				.send({ contractId: 'test', signer: 'test' })
				.expect(401)
		})

		it('PUT /escrow/update-escrow-by-contract-id should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.put('/escrow/update-escrow-by-contract-id')
				.send({ contractId: 'test', signer: 'test', escrow: {} })
				.expect(401)
		})

		it('GET /escrow/get-escrow-by-contract-id should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/escrow/get-escrow-by-contract-id')
				.query({ contractId: 'test' })
				.expect(401)
		})
	})

	describe('Unauthorized access — Multi Release', () => {
		it('POST /escrow/multi-release/fund-escrow should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/fund-escrow')
				.send({ contractId: 'test', signer: 'test', amount: '100' })
				.expect(401)
		})

		it('POST /escrow/multi-release/change-milestone-status should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/change-milestone-status')
				.send({ contractId: 'test', milestoneIndex: '0' })
				.expect(401)
		})

		it('POST /escrow/multi-release/approve-milestone should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/approve-milestone')
				.send({ contractId: 'test', milestoneIndex: '0' })
				.expect(401)
		})

		it('POST /escrow/multi-release/release-milestone-funds should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/release-milestone-funds')
				.send({ contractId: 'test', milestoneIndex: '0' })
				.expect(401)
		})

		it('POST /escrow/multi-release/dispute-milestone should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/dispute-milestone')
				.send({ contractId: 'test', milestoneIndex: '0' })
				.expect(401)
		})

		it('POST /escrow/multi-release/resolve-milestone-dispute should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/resolve-milestone-dispute')
				.send({ contractId: 'test', milestoneIndex: '0' })
				.expect(401)
		})

		it('POST /escrow/multi-release/withdraw-remaining-funds should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/escrow/multi-release/withdraw-remaining-funds')
				.send({ contractId: 'test' })
				.expect(401)
		})
	})
})
