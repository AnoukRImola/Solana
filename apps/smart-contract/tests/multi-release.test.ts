import * as anchor from '@coral-xyz/anchor'
import { type Escrow } from '@programs/solana-tl'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import {
	createMint,
	createAccount as createTokenAccount,
	mintTo,
	getAccount,
	TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { assert } from 'chai'

describe('Escrow Program - Multi Release', () => {
	anchor.setProvider(anchor.AnchorProvider.env())
	const program = anchor.workspace.Escrow as anchor.Program<Escrow>
	const provider = anchor.getProvider() as anchor.AnchorProvider
	const connection = provider.connection

	let mint: PublicKey
	let engagementId: string
	let escrowPda: PublicKey
	let escrowTokenAccount: PublicKey

	const approver = Keypair.generate()
	const serviceProvider = Keypair.generate()
	const platform = Keypair.generate()
	const releaseSigner = Keypair.generate()
	const disputeResolver = Keypair.generate()
	const receiver1 = Keypair.generate()
	const receiver2 = Keypair.generate()
	const receiver3 = Keypair.generate()
	const trustlessWorkWallet = Keypair.generate()

	let approverTokenAccount: PublicKey
	let platformTokenAccount: PublicKey
	let trustlessWorkTokenAccount: PublicKey
	let receiver1TokenAccount: PublicKey
	let receiver2TokenAccount: PublicKey
	let receiver3TokenAccount: PublicKey
	let funderTokenAccount: PublicKey

	const milestone1Amount = 500_000 // 0.5 USDC
	const milestone2Amount = 300_000 // 0.3 USDC
	const milestone3Amount = 200_000 // 0.2 USDC
	const totalAmount = milestone1Amount + milestone2Amount + milestone3Amount
	const platformFee = new anchor.BN(500) // 5%

	before(async () => {
		const airdrops = [
			approver, serviceProvider, platform, releaseSigner,
			disputeResolver, receiver1, receiver2, receiver3,
			trustlessWorkWallet,
		].map(async (kp) => {
			const sig = await connection.requestAirdrop(
				kp.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)
		})
		await Promise.all(airdrops)

		const payer = (provider.wallet as anchor.Wallet).payer

		mint = await createMint(connection, payer, provider.publicKey, null, 6)

		engagementId = `mr-eng-${Date.now()}`
		;[escrowPda] = PublicKey.findProgramAddressSync(
			[Buffer.from('multi_escrow'), Buffer.from(engagementId)],
			program.programId,
		)

		escrowTokenAccount = await createTokenAccount(
			connection, payer, mint, escrowPda, Keypair.generate(),
		)

		funderTokenAccount = await createTokenAccount(
			connection, payer, mint, provider.publicKey, Keypair.generate(),
		)
		approverTokenAccount = await createTokenAccount(
			connection, payer, mint, approver.publicKey, Keypair.generate(),
		)
		platformTokenAccount = await createTokenAccount(
			connection, payer, mint, platform.publicKey, Keypair.generate(),
		)
		trustlessWorkTokenAccount = await createTokenAccount(
			connection, payer, mint, trustlessWorkWallet.publicKey, Keypair.generate(),
		)
		receiver1TokenAccount = await createTokenAccount(
			connection, payer, mint, receiver1.publicKey, Keypair.generate(),
		)
		receiver2TokenAccount = await createTokenAccount(
			connection, payer, mint, receiver2.publicKey, Keypair.generate(),
		)
		receiver3TokenAccount = await createTokenAccount(
			connection, payer, mint, receiver3.publicKey, Keypair.generate(),
		)

		await mintTo(connection, payer, mint, funderTokenAccount, provider.publicKey, 2_000_000)
	})

	describe('initialize_multi_release_escrow', () => {
		it('should initialize a multi-release escrow', async () => {
			await program.methods
				.initializeMultiReleaseEscrow({
					engagementId,
					title: 'Multi-Release Test',
					description: 'Testing multi-release escrow flow',
					platformFee,
					milestones: [
						{
							description: 'Frontend development',
							status: 'Pending',
							evidence: '',
							amount: new anchor.BN(milestone1Amount),
							receiver: receiver1.publicKey,
							flags: { approved: false, disputed: false, released: false, resolved: false },
						},
						{
							description: 'Backend development',
							status: 'Pending',
							evidence: '',
							amount: new anchor.BN(milestone2Amount),
							receiver: receiver2.publicKey,
							flags: { approved: false, disputed: false, released: false, resolved: false },
						},
						{
							description: 'Deployment & QA',
							status: 'Pending',
							evidence: '',
							amount: new anchor.BN(milestone3Amount),
							receiver: receiver3.publicKey,
							flags: { approved: false, disputed: false, released: false, resolved: false },
						},
					],
					trustline: { address: mint, decimals: 6 },
					roles: {
						approver: approver.publicKey,
						serviceProvider: serviceProvider.publicKey,
						platformAddress: platform.publicKey,
						releaseSigner: releaseSigner.publicKey,
						disputeResolver: disputeResolver.publicKey,
					},
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			const fetched = await program.account.multiReleaseEscrowData.fetch(escrowPda)
			assert.equal(fetched.engagementId, engagementId)
			assert.equal(fetched.milestones.length, 3)
			assert.equal(fetched.isInitialized, true)
			assert.equal(fetched.milestones[0].amount.toNumber(), milestone1Amount)
			assert.equal(fetched.milestones[1].amount.toNumber(), milestone2Amount)
			assert.equal(fetched.milestones[2].amount.toNumber(), milestone3Amount)
			assert.deepEqual(
				fetched.milestones[0].receiver.toBase58(),
				receiver1.publicKey.toBase58(),
			)
		})

		it('should fail with zero milestone amount', async () => {
			const badId = `mr-bad-${Date.now()}`
			const [badPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('multi_escrow'), Buffer.from(badId)],
				program.programId,
			)

			try {
				await program.methods
					.initializeMultiReleaseEscrow({
						engagementId: badId,
						title: 'Bad',
						description: 'Should fail',
						platformFee: new anchor.BN(100),
						milestones: [{
							description: 'M1',
							status: 'Pending',
							evidence: '',
							amount: new anchor.BN(0),
							receiver: receiver1.publicKey,
							flags: { approved: false, disputed: false, released: false, resolved: false },
						}],
						trustline: { address: mint, decimals: 6 },
						roles: {
							approver: approver.publicKey,
							serviceProvider: serviceProvider.publicKey,
							platformAddress: platform.publicKey,
							releaseSigner: releaseSigner.publicKey,
							disputeResolver: disputeResolver.publicKey,
						},
						balance: new anchor.BN(0),
						isInitialized: false,
					})
					.accounts({
						escrowAccount: badPda,
						initializer: provider.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.rpc()
				assert.fail('Should have thrown MilestoneAmountCannotBeZero')
			} catch (err: any) {
				assert.include(err.message, 'MilestoneAmountCannotBeZero')
			}
		})
	})

	describe('fund_multi_release_escrow', () => {
		it('should fund the multi-release escrow', async () => {
			await program.methods
				.fundMultiReleaseEscrow(new anchor.BN(totalAmount))
				.accounts({
					signer: provider.publicKey,
					escrowAccount: escrowPda,
					escrowTokenAccount,
					userTokenAccount: funderTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.rpc()

			const escrowToken = await getAccount(connection, escrowTokenAccount)
			assert.equal(Number(escrowToken.amount), totalAmount)
		})
	})

	describe('milestone lifecycle — approve and release', () => {
		it('should update milestone status', async () => {
			await program.methods
				.changeMultiReleaseMilestoneStatus(0, 'Completed', 'Frontend done')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			const fetched = await program.account.multiReleaseEscrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[0].status, 'Completed')
			assert.equal(fetched.milestones[0].evidence, 'Frontend done')
		})

		it('should approve milestone', async () => {
			await program.methods
				.approveMultiReleaseMilestone(0, true)
				.accounts({
					approver: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			const fetched = await program.account.multiReleaseEscrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[0].flags.approved, true)
		})

		it('should release funds for approved milestone', async () => {
			await program.methods
				.releaseMilestoneFunds(0)
				.accounts({
					releaseSigner: releaseSigner.publicKey,
					escrowAccount: escrowPda,
					escrowTokenAccount,
					trustlessWorkAccount: trustlessWorkTokenAccount,
					platformAccount: platformTokenAccount,
					receiverAccount: receiver1TokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([releaseSigner])
				.rpc()

			const fetched = await program.account.multiReleaseEscrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[0].flags.released, true)

			const r1Token = await getAccount(connection, receiver1TokenAccount)
			assert.ok(Number(r1Token.amount) > 0, 'Receiver 1 got tokens')
		})

		it('should fail to release already-released milestone', async () => {
			try {
				await program.methods
					.releaseMilestoneFunds(0)
					.accounts({
						releaseSigner: releaseSigner.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: trustlessWorkTokenAccount,
						platformAccount: platformTokenAccount,
						receiverAccount: receiver1TokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([releaseSigner])
					.rpc()
				assert.fail('Should have thrown MilestoneAlreadyReleased')
			} catch (err: any) {
				assert.include(err.message, 'MilestoneAlreadyReleased')
			}
		})

		it('should fail to release unapproved milestone', async () => {
			try {
				await program.methods
					.releaseMilestoneFunds(1)
					.accounts({
						releaseSigner: releaseSigner.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: trustlessWorkTokenAccount,
						platformAccount: platformTokenAccount,
						receiverAccount: receiver2TokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([releaseSigner])
					.rpc()
				assert.fail('Should have thrown MilestoneNotApproved')
			} catch (err: any) {
				assert.include(err.message, 'MilestoneNotApproved')
			}
		})
	})

	describe('milestone lifecycle — dispute and resolve', () => {
		it('should dispute milestone 2', async () => {
			await program.methods
				.disputeMilestone(1)
				.accounts({
					signer: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			const fetched = await program.account.multiReleaseEscrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[1].flags.disputed, true)
		})

		it('should fail to dispute already-disputed milestone', async () => {
			try {
				await program.methods
					.disputeMilestone(1)
					.accounts({
						signer: serviceProvider.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([serviceProvider])
					.rpc()
				assert.fail('Should have thrown MilestoneAlreadyDisputed')
			} catch (err: any) {
				assert.include(err.message, 'MilestoneAlreadyDisputed')
			}
		})

		it('should resolve milestone dispute', async () => {
			const approverFunds = new anchor.BN(180_000) // 60% of 300k
			const receiverFunds = new anchor.BN(120_000) // 40% of 300k

			await program.methods
				.resolveMilestoneDispute(1, approverFunds, receiverFunds)
				.accounts({
					disputeResolver: disputeResolver.publicKey,
					escrowAccount: escrowPda,
					escrowTokenAccount,
					trustlessWorkAccount: trustlessWorkTokenAccount,
					platformAccount: platformTokenAccount,
					approverAccount: approverTokenAccount,
					receiverAccount: receiver2TokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([disputeResolver])
				.rpc()

			const fetched = await program.account.multiReleaseEscrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[1].flags.resolved, true)
			assert.equal(fetched.milestones[1].flags.disputed, false)

			const approverToken = await getAccount(connection, approverTokenAccount)
			assert.ok(Number(approverToken.amount) > 0, 'Approver received funds')
		})
	})

	describe('withdraw_remaining_funds', () => {
		it('should fail when not all milestones settled', async () => {
			try {
				await program.methods
					.withdrawRemainingFunds()
					.accounts({
						approver: approver.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						approverTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([approver])
					.rpc()
				assert.fail('Should have thrown NotAllMilestonesSettled')
			} catch (err: any) {
				assert.include(err.message, 'NotAllMilestonesSettled')
			}
		})

		it('should withdraw after all milestones settled', async () => {
			// Complete milestone 3: status → approve → release
			await program.methods
				.changeMultiReleaseMilestoneStatus(2, 'Completed', 'Deployed')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			await program.methods
				.approveMultiReleaseMilestone(2, true)
				.accounts({
					approver: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			await program.methods
				.releaseMilestoneFunds(2)
				.accounts({
					releaseSigner: releaseSigner.publicKey,
					escrowAccount: escrowPda,
					escrowTokenAccount,
					trustlessWorkAccount: trustlessWorkTokenAccount,
					platformAccount: platformTokenAccount,
					receiverAccount: receiver3TokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([releaseSigner])
				.rpc()

			// Now all milestones are settled (M0: released, M1: resolved, M2: released)
			const escrowToken = await getAccount(connection, escrowTokenAccount)
			const remaining = Number(escrowToken.amount)

			if (remaining > 0) {
				await program.methods
					.withdrawRemainingFunds()
					.accounts({
						approver: approver.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						approverTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([approver])
					.rpc()

				const escrowTokenAfter = await getAccount(connection, escrowTokenAccount)
				assert.equal(Number(escrowTokenAfter.amount), 0)
			}

			// Verify all parties received tokens
			const r1 = await getAccount(connection, receiver1TokenAccount)
			const r3 = await getAccount(connection, receiver3TokenAccount)
			assert.ok(Number(r1.amount) > 0, 'Receiver 1 got paid')
			assert.ok(Number(r3.amount) > 0, 'Receiver 3 got paid')
		})
	})
})
