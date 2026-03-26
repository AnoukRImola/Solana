import { type INestApplication, ValidationPipe } from '@nestjs/common'
import { Test, type TestingModule } from '@nestjs/testing'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'

describe('Compliance Controller (e2e)', () => {
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

	describe('Unauthorized access', () => {
		it('POST /compliance/initialize-registry should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/compliance/initialize-registry')
				.send({ authority: 'test', travelRuleThreshold: 1000 })
				.expect(401)
		})

		it('POST /compliance/verify-address should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/compliance/verify-address')
				.send({
					address: 'test',
					kycProvider: 'sumsub',
					jurisdiction: 'US',
					riskScore: 25,
				})
				.expect(401)
		})

		it('POST /compliance/revoke-verification should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/compliance/revoke-verification')
				.send({ address: 'test' })
				.expect(401)
		})

		it('POST /compliance/set-escrow-compliance should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/compliance/set-escrow-compliance')
				.send({ escrowAddress: 'test', requiresKyc: true })
				.expect(401)
		})

		it('POST /compliance/set-travel-rule-data should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.post('/compliance/set-travel-rule-data')
				.send({
					escrowAddress: 'test',
					travelRuleData: {
						originatorName: 'Alice',
						originatorAccount: 'acc1',
						originatorJurisdiction: 'US',
						beneficiaryName: 'Bob',
						beneficiaryAccount: 'acc2',
						beneficiaryJurisdiction: 'GB',
						transferPurpose: 'Payment',
					},
				})
				.expect(401)
		})

		it('GET /compliance/verification should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/verification')
				.query({ address: 'test' })
				.expect(401)
		})

		it('GET /compliance/escrow-compliance should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/escrow-compliance')
				.query({ escrowAddress: 'test' })
				.expect(401)
		})

		it('GET /compliance/registry should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/registry')
				.expect(401)
		})

		it('GET /compliance/audit-logs should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/audit-logs')
				.expect(401)
		})

		it('GET /compliance/suspicious-activity should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/suspicious-activity')
				.query({ address: 'test' })
				.expect(401)
		})

		it('GET /compliance/escrows/by-signer should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/escrows/by-signer')
				.query({ signer: 'test' })
				.expect(401)
		})

		it('GET /compliance/escrows/by-role should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/escrows/by-role')
				.query({ address: 'test', role: 'approver' })
				.expect(401)
		})

		it('GET /compliance/escrows/by-engagement should return 401 without JWT', () => {
			return request(app.getHttpServer())
				.get('/compliance/escrows/by-engagement')
				.query({ engagementId: 'test' })
				.expect(401)
		})
	})
})
