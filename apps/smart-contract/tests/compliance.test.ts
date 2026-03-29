import * as anchor from '@coral-xyz/anchor'
import { type Escrow, EscrowIDL } from '@programs/solana-tl'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import { assert } from 'chai'

describe('Escrow Program - Compliance Layer', () => {
	anchor.setProvider(anchor.AnchorProvider.env())
	const program = anchor.workspace.Escrow as anchor.Program<Escrow>
	const provider = anchor.getProvider() as anchor.AnchorProvider
	const connection = provider.connection

	const authority = Keypair.generate()
	const unauthorizedUser = Keypair.generate()
	const userToVerify = Keypair.generate()
	const escrowAddress = Keypair.generate()

	let registryPda: PublicKey
	let registryBump: number
	let verificationPda: PublicKey
	let verificationBump: number
	let compliancePda: PublicKey
	let complianceBump: number

	const travelRuleThreshold = new anchor.BN(1_000_000) // 1 USDC

	before(async () => {
		// Airdrop SOL to signers
		const airdrops = [authority, unauthorizedUser, userToVerify].map(
			async (kp) => {
				const sig = await connection.requestAirdrop(
					kp.publicKey,
					10 * anchor.web3.LAMPORTS_PER_SOL,
				)
				await connection.confirmTransaction(sig)
			},
		)
		await Promise.all(airdrops)

		// Derive PDAs
		;[registryPda, registryBump] = PublicKey.findProgramAddressSync(
			[Buffer.from('compliance_registry')],
			program.programId,
		)
		;[verificationPda, verificationBump] = PublicKey.findProgramAddressSync(
			[Buffer.from('kyc'), userToVerify.publicKey.toBuffer()],
			program.programId,
		)
		;[compliancePda, complianceBump] = PublicKey.findProgramAddressSync(
			[Buffer.from('escrow_compliance'), escrowAddress.publicKey.toBuffer()],
			program.programId,
		)
	})

	// ============================
	// Initialize Compliance Registry
	// ============================

	describe('initialize_compliance_registry', () => {
		it('should initialize compliance registry', async () => {
			await program.methods
				.initializeComplianceRegistry(travelRuleThreshold)
				.accountsStrict({
					registry: registryPda,
					authority: authority.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.signers([authority])
				.rpc()

			const registry =
				await program.account.complianceRegistry.fetch(registryPda)
			assert.ok(registry.authority.equals(authority.publicKey))
			assert.ok(registry.travelRuleThreshold.eq(travelRuleThreshold))
			assert.isTrue(registry.isInitialized)
		})

		it('should fail if registry already initialized (PDA collision)', async () => {
			try {
				await program.methods
					.initializeComplianceRegistry(travelRuleThreshold)
					.accountsStrict({
						registry: registryPda,
						authority: authority.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.signers([authority])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				// init constraint prevents re-initialization (account already exists)
				assert.ok(err)
			}
		})
	})

	// ============================
	// Verify Address (KYC)
	// ============================

	describe('verify_address', () => {
		it('should verify an address with KYC data', async () => {
			await program.methods
				.verifyAddress('sumsub', 'US', 25)
				.accountsStrict({
					authority: authority.publicKey,
					registry: registryPda,
					verification: verificationPda,
					address: userToVerify.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.signers([authority])
				.rpc()

			const verification =
				await program.account.addressVerification.fetch(verificationPda)
			assert.ok(verification.address.equals(userToVerify.publicKey))
			assert.isTrue(verification.kycVerified)
			assert.equal(verification.kycProvider, 'sumsub')
			assert.equal(verification.riskScore, 25)
			assert.equal(verification.jurisdiction, 'US')
			assert.ok(verification.kycTimestamp.toNumber() > 0)
		})

		it('should fail if caller is not the compliance authority', async () => {
			const anotherUser = Keypair.generate()
			const sig = await connection.requestAirdrop(
				anotherUser.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)

			const [anotherVerificationPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('kyc'), anotherUser.publicKey.toBuffer()],
				program.programId,
			)

			try {
				await program.methods
					.verifyAddress('jumio', 'GB', 10)
					.accountsStrict({
						authority: unauthorizedUser.publicKey,
						registry: registryPda,
						verification: anotherVerificationPda,
						address: anotherUser.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.signers([unauthorizedUser])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})

		it('should fail for sanctioned jurisdiction (KP)', async () => {
			const sanctionedUser = Keypair.generate()
			const sig = await connection.requestAirdrop(
				sanctionedUser.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)

			const [sanctionedPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('kyc'), sanctionedUser.publicKey.toBuffer()],
				program.programId,
			)

			try {
				await program.methods
					.verifyAddress('sumsub', 'KP', 90)
					.accountsStrict({
						authority: authority.publicKey,
						registry: registryPda,
						verification: sanctionedPda,
						address: sanctionedUser.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.signers([authority])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})

		it('should fail for sanctioned jurisdiction (IR)', async () => {
			const sanctionedUser = Keypair.generate()
			const sig = await connection.requestAirdrop(
				sanctionedUser.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)

			const [sanctionedPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('kyc'), sanctionedUser.publicKey.toBuffer()],
				program.programId,
			)

			try {
				await program.methods
					.verifyAddress('sumsub', 'IR', 85)
					.accountsStrict({
						authority: authority.publicKey,
						registry: registryPda,
						verification: sanctionedPda,
						address: sanctionedUser.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.signers([authority])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})
	})

	// ============================
	// Revoke Verification
	// ============================

	describe('revoke_verification', () => {
		let revokeUser: Keypair
		let revokeVerificationPda: PublicKey

		before(async () => {
			revokeUser = Keypair.generate()
			const sig = await connection.requestAirdrop(
				revokeUser.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)
			;[revokeVerificationPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('kyc'), revokeUser.publicKey.toBuffer()],
				program.programId,
			)

			// First verify the address
			await program.methods
				.verifyAddress('sumsub', 'DE', 15)
				.accountsStrict({
					authority: authority.publicKey,
					registry: registryPda,
					verification: revokeVerificationPda,
					address: revokeUser.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.signers([authority])
				.rpc()
		})

		it('should revoke verification and close account', async () => {
			await program.methods
				.revokeVerification()
				.accountsStrict({
					authority: authority.publicKey,
					registry: registryPda,
					verification: revokeVerificationPda,
				})
				.signers([authority])
				.rpc()

			// Account should be closed
			const info = await connection.getAccountInfo(revokeVerificationPda)
			assert.isNull(info)
		})

		it('should fail if caller is not the compliance authority', async () => {
			// First re-verify with a new user to have something to revoke
			const newUser = Keypair.generate()
			const sig = await connection.requestAirdrop(
				newUser.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)

			const [newPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('kyc'), newUser.publicKey.toBuffer()],
				program.programId,
			)

			await program.methods
				.verifyAddress('sumsub', 'FR', 20)
				.accountsStrict({
					authority: authority.publicKey,
					registry: registryPda,
					verification: newPda,
					address: newUser.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.signers([authority])
				.rpc()

			try {
				await program.methods
					.revokeVerification()
					.accountsStrict({
						authority: unauthorizedUser.publicKey,
						registry: registryPda,
						verification: newPda,
					})
					.signers([unauthorizedUser])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})
	})

	// ============================
	// Set Escrow Compliance
	// ============================

	describe('set_escrow_compliance', () => {
		it('should set compliance for an escrow', async () => {
			await program.methods
				.setEscrowCompliance(true)
				.accountsStrict({
					authority: authority.publicKey,
					registry: registryPda,
					compliance: compliancePda,
					escrowAddress: escrowAddress.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.signers([authority])
				.rpc()

			const compliance =
				await program.account.escrowCompliance.fetch(compliancePda)
			assert.ok(compliance.escrowAddress.equals(escrowAddress.publicKey))
			assert.isTrue(compliance.requiresKyc)
			assert.isNull(compliance.travelRule)
		})

		it('should fail if caller is not the compliance authority', async () => {
			const anotherEscrow = Keypair.generate()
			const [anotherCompliancePda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow_compliance'), anotherEscrow.publicKey.toBuffer()],
				program.programId,
			)

			try {
				await program.methods
					.setEscrowCompliance(false)
					.accountsStrict({
						authority: unauthorizedUser.publicKey,
						registry: registryPda,
						compliance: anotherCompliancePda,
						escrowAddress: anotherEscrow.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.signers([unauthorizedUser])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})
	})

	// ============================
	// Set Travel Rule Data
	// ============================

	describe('set_travel_rule_data', () => {
		it('should set travel rule data on escrow compliance', async () => {
			const travelRule = {
				originatorName: 'Alice Corp',
				originatorAccount: 'alice-account-001',
				originatorJurisdiction: 'US',
				beneficiaryName: 'Bob Inc',
				beneficiaryAccount: 'bob-account-002',
				beneficiaryJurisdiction: 'GB',
				transferPurpose: 'Service payment for software development',
			}

			await program.methods
				.setTravelRuleData(travelRule)
				.accountsStrict({
					authority: authority.publicKey,
					registry: registryPda,
					compliance: compliancePda,
				})
				.signers([authority])
				.rpc()

			const compliance =
				await program.account.escrowCompliance.fetch(compliancePda)
			assert.isNotNull(compliance.travelRule)
			assert.equal(compliance.travelRule.originatorName, 'Alice Corp')
			assert.equal(compliance.travelRule.beneficiaryName, 'Bob Inc')
			assert.equal(compliance.travelRule.originatorJurisdiction, 'US')
			assert.equal(compliance.travelRule.beneficiaryJurisdiction, 'GB')
			assert.equal(
				compliance.travelRule.transferPurpose,
				'Service payment for software development',
			)
		})

		it('should fail if originator jurisdiction is sanctioned', async () => {
			const travelRule = {
				originatorName: 'Sanctioned Entity',
				originatorAccount: 'sanctioned-001',
				originatorJurisdiction: 'KP',
				beneficiaryName: 'Bob Inc',
				beneficiaryAccount: 'bob-002',
				beneficiaryJurisdiction: 'US',
				transferPurpose: 'Payment',
			}

			try {
				await program.methods
					.setTravelRuleData(travelRule)
					.accountsStrict({
						authority: authority.publicKey,
						registry: registryPda,
						compliance: compliancePda,
					})
					.signers([authority])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})

		it('should fail if beneficiary jurisdiction is sanctioned', async () => {
			const travelRule = {
				originatorName: 'Alice Corp',
				originatorAccount: 'alice-001',
				originatorJurisdiction: 'US',
				beneficiaryName: 'Sanctioned Receiver',
				beneficiaryAccount: 'sanctioned-002',
				beneficiaryJurisdiction: 'SY',
				transferPurpose: 'Payment',
			}

			try {
				await program.methods
					.setTravelRuleData(travelRule)
					.accountsStrict({
						authority: authority.publicKey,
						registry: registryPda,
						compliance: compliancePda,
					})
					.signers([authority])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})

		it('should fail if caller is not the compliance authority', async () => {
			const travelRule = {
				originatorName: 'Alice Corp',
				originatorAccount: 'alice-001',
				originatorJurisdiction: 'US',
				beneficiaryName: 'Bob Inc',
				beneficiaryAccount: 'bob-002',
				beneficiaryJurisdiction: 'GB',
				transferPurpose: 'Payment',
			}

			try {
				await program.methods
					.setTravelRuleData(travelRule)
					.accountsStrict({
						authority: unauthorizedUser.publicKey,
						registry: registryPda,
						compliance: compliancePda,
					})
					.signers([unauthorizedUser])
					.rpc()
				assert.fail('Should have thrown an error')
			} catch (err) {
				assert.ok(err)
			}
		})
	})
})
