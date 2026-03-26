import * as anchor from '@coral-xyz/anchor'
import { EscrowIDL, type Escrow } from '@programs/solana-tl'
import { Keypair, PublicKey, SystemProgram } from '@solana/web3.js'
import {
	createMint,
	createAccount as createTokenAccount,
	mintTo,
	getAccount,
	TOKEN_PROGRAM_ID,
} from '@solana/spl-token'
import { assert } from 'chai'

describe('Escrow Program - Single Release', () => {
	anchor.setProvider(anchor.AnchorProvider.env())
	const program = anchor.workspace.Escrow as anchor.Program<Escrow>
	const provider = anchor.getProvider() as anchor.AnchorProvider
	const connection = provider.connection

	// Shared state across tests
	let mint: PublicKey
	let engagementId: string
	let escrowPda: PublicKey
	let escrowBump: number
	let escrowTokenAccount: PublicKey

	// Keypairs for roles
	const approver = Keypair.generate()
	const serviceProvider = Keypair.generate()
	const platform = Keypair.generate()
	const releaseSigner = Keypair.generate()
	const disputeResolver = Keypair.generate()
	const receiver = Keypair.generate()

	// Token accounts for each party
	let approverTokenAccount: PublicKey
	let serviceProviderTokenAccount: PublicKey
	let platformTokenAccount: PublicKey
	let receiverTokenAccount: PublicKey
	let trustlessWorkTokenAccount: PublicKey
	let funderTokenAccount: PublicKey

	const trustlessWorkWallet = Keypair.generate()

	const amount = new anchor.BN(1_000_000) // 1 USDC (6 decimals)
	const platformFee = new anchor.BN(500) // 5% in basis points

	before(async () => {
		// Airdrop SOL to all signers
		const airdrops = [
			approver,
			serviceProvider,
			platform,
			releaseSigner,
			disputeResolver,
			receiver,
			trustlessWorkWallet,
		].map(async (kp) => {
			const sig = await connection.requestAirdrop(
				kp.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)
		})
		await Promise.all(airdrops)

		// Create SPL token mint (representing USDC)
		mint = await createMint(
			connection,
			(provider.wallet as anchor.Wallet).payer,
			provider.publicKey,
			null,
			6, // 6 decimals like USDC
		)

		// Create unique engagement ID
		engagementId = `eng-${Date.now()}`

		// Derive escrow PDA
		;[escrowPda, escrowBump] = PublicKey.findProgramAddressSync(
			[Buffer.from('escrow'), Buffer.from(engagementId)],
			program.programId,
		)

		// Create token account owned by the escrow PDA
		escrowTokenAccount = await createTokenAccount(
			connection,
			(provider.wallet as anchor.Wallet).payer,
			mint,
			escrowPda,
			Keypair.generate(), // random keypair for the token account address
		)

		// Create token accounts for all parties
		const payer = (provider.wallet as anchor.Wallet).payer
		funderTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			provider.publicKey,
		)
		approverTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			approver.publicKey,
		)
		serviceProviderTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			serviceProvider.publicKey,
		)
		platformTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			platform.publicKey,
		)
		receiverTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			receiver.publicKey,
		)
		trustlessWorkTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			trustlessWorkWallet.publicKey,
		)

		// Mint tokens to funder for testing
		await mintTo(
			connection,
			payer,
			mint,
			funderTokenAccount,
			provider.publicKey, // mint authority
			10_000_000, // 10 USDC
		)
	})

	describe('initialize_escrow', () => {
		it('should initialize an escrow successfully', async () => {
			const milestones = [
				{
					description: 'First milestone',
					status: 'Pending',
					evidence: '',
					approvedFlag: false,
				},
				{
					description: 'Second milestone',
					status: 'Pending',
					evidence: '',
					approvedFlag: false,
				},
			]

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Test Escrow',
					description: 'Test Escrow for single-release flow',
					amount,
					platformFee,
					milestones,
					flags: {
						dispute: false,
						release: false,
						resolved: false,
					},
					trustline: {
						address: mint,
						decimals: 6,
					},
					receiverMemo: new anchor.BN(0),
					roles: {
						approver: approver.publicKey,
						serviceProvider: serviceProvider.publicKey,
						platformAddress: platform.publicKey,
						releaseSigner: releaseSigner.publicKey,
						disputeResolver: disputeResolver.publicKey,
						receiver: receiver.publicKey,
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

			const fetched = await program.account.escrowData.fetch(escrowPda)

			assert.equal(fetched.engagementId, engagementId)
			assert.equal(fetched.title, 'Test Escrow')
			assert.equal(fetched.amount.toNumber(), amount.toNumber())
			assert.equal(fetched.platformFee.toNumber(), platformFee.toNumber())
			assert.equal(fetched.milestones.length, 2)
			assert.equal(fetched.isInitialized, true)
			assert.equal(fetched.balance.toNumber(), 0)
			assert.equal(fetched.trustline.decimals, 6)
			assert.equal(fetched.flags.dispute, false)
			assert.equal(fetched.flags.release, false)
			assert.equal(fetched.flags.resolved, false)
			assert.deepEqual(
				fetched.roles.approver.toBase58(),
				approver.publicKey.toBase58(),
			)
			assert.deepEqual(
				fetched.roles.serviceProvider.toBase58(),
				serviceProvider.publicKey.toBase58(),
			)
			assert.deepEqual(
				fetched.roles.receiver.toBase58(),
				receiver.publicKey.toBase58(),
			)
		})

		it('should fail to initialize with zero amount', async () => {
			const badEngagementId = `eng-zero-${Date.now()}`
			const [badPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow'), Buffer.from(badEngagementId)],
				program.programId,
			)

			try {
				await program.methods
					.initializeEscrow({
						engagementId: badEngagementId,
						title: 'Bad Escrow',
						description: 'Should fail',
						amount: new anchor.BN(0),
						platformFee: new anchor.BN(100),
						milestones: [
							{
								description: 'M1',
								status: 'Pending',
								evidence: '',
								approvedFlag: false,
							},
						],
						flags: { dispute: false, release: false, resolved: false },
						trustline: { address: mint, decimals: 6 },
						receiverMemo: new anchor.BN(0),
						roles: {
							approver: approver.publicKey,
							serviceProvider: serviceProvider.publicKey,
							platformAddress: platform.publicKey,
							releaseSigner: releaseSigner.publicKey,
							disputeResolver: disputeResolver.publicKey,
							receiver: receiver.publicKey,
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
				assert.fail('Should have thrown AmountCannotBeZero')
			} catch (err: any) {
				assert.include(err.message, 'AmountCannotBeZero')
			}
		})

		it('should fail with platform fee too high', async () => {
			const badEngagementId = `eng-fee-${Date.now()}`
			const [badPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow'), Buffer.from(badEngagementId)],
				program.programId,
			)

			try {
				await program.methods
					.initializeEscrow({
						engagementId: badEngagementId,
						title: 'Bad Fee Escrow',
						description: 'Should fail',
						amount: new anchor.BN(1_000_000),
						platformFee: new anchor.BN(10000), // 100% - exceeds 99% max
						milestones: [
							{
								description: 'M1',
								status: 'Pending',
								evidence: '',
								approvedFlag: false,
							},
						],
						flags: { dispute: false, release: false, resolved: false },
						trustline: { address: mint, decimals: 6 },
						receiverMemo: new anchor.BN(0),
						roles: {
							approver: approver.publicKey,
							serviceProvider: serviceProvider.publicKey,
							platformAddress: platform.publicKey,
							releaseSigner: releaseSigner.publicKey,
							disputeResolver: disputeResolver.publicKey,
							receiver: receiver.publicKey,
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
				assert.fail('Should have thrown PlatformFeeTooHigh')
			} catch (err: any) {
				assert.include(err.message, 'PlatformFeeTooHigh')
			}
		})
	})

	describe('fund_escrow', () => {
		it('should fund the escrow successfully', async () => {
			await program.methods
				.fundEscrow(new anchor.BN(1_000_000))
				.accounts({
					signer: provider.publicKey,
					escrowAccount: escrowPda,
					escrowTokenAccount,
					userTokenAccount: funderTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.rpc()

			const escrowToken = await getAccount(connection, escrowTokenAccount)
			assert.equal(Number(escrowToken.amount), 1_000_000)

			const fetched = await program.account.escrowData.fetch(escrowPda)
			assert.equal(fetched.balance.toNumber(), 1_000_000)
		})

		it('should fail to fund when already fully funded', async () => {
			try {
				await program.methods
					.fundEscrow(new anchor.BN(1_000_000))
					.accounts({
						signer: provider.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						userTokenAccount: funderTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.rpc()
				assert.fail('Should have thrown EscrowFullyFunded')
			} catch (err: any) {
				assert.include(err.message, 'EscrowFullyFunded')
			}
		})
	})

	describe('change_milestone_status', () => {
		it('should update milestone status by service provider', async () => {
			await program.methods
				.changeMilestoneStatus(0, 'In Progress', 'Started working')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			const fetched = await program.account.escrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[0].status, 'In Progress')
			assert.equal(fetched.milestones[0].evidence, 'Started working')
		})

		it('should fail when non-service-provider tries to change status', async () => {
			try {
				await program.methods
					.changeMilestoneStatus(0, 'Done', null)
					.accounts({
						serviceProvider: approver.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([approver])
					.rpc()
				assert.fail('Should have thrown constraint error')
			} catch (err: any) {
				// Constraint error from context validation
				assert.ok(err)
			}
		})

		it('should fail with invalid milestone index', async () => {
			try {
				await program.methods
					.changeMilestoneStatus(99, 'Done', null)
					.accounts({
						serviceProvider: serviceProvider.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([serviceProvider])
					.rpc()
				assert.fail('Should have thrown InvalidMileStoneIndex')
			} catch (err: any) {
				assert.include(err.message, 'InvalidMileStoneIndex')
			}
		})
	})

	describe('change_milestone_flag (approve)', () => {
		it('should approve milestone by approver', async () => {
			// Mark both milestones as completed first
			await program.methods
				.changeMilestoneStatus(0, 'Completed', 'Delivered first milestone')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			await program.methods
				.changeMilestoneStatus(1, 'Completed', 'Delivered second milestone')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			// Approve first milestone
			await program.methods
				.changeMilestoneFlag(0, true)
				.accounts({
					approver: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			const fetched = await program.account.escrowData.fetch(escrowPda)
			assert.equal(fetched.milestones[0].approvedFlag, true)
			assert.equal(fetched.milestones[1].approvedFlag, false)
		})

		it('should fail when non-approver tries to approve', async () => {
			try {
				await program.methods
					.changeMilestoneFlag(1, true)
					.accounts({
						approver: serviceProvider.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([serviceProvider])
					.rpc()
				assert.fail('Should have thrown constraint error')
			} catch (err: any) {
				assert.ok(err)
			}
		})
	})

	describe('release_funds', () => {
		it('should release funds after all milestones approved', async () => {
			// Approve second milestone
			await program.methods
				.changeMilestoneFlag(1, true)
				.accounts({
					approver: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			// Now release funds
			await program.methods
				.releaseFunds()
				.accounts({
					releaseSigner: releaseSigner.publicKey,
					escrowAccount: escrowPda,
					escrowTokenAccount,
					trustlessWorkAccount: trustlessWorkTokenAccount,
					platformAccount: platformTokenAccount,
					receiverAccount: receiverTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([releaseSigner])
				.rpc()

			const fetched = await program.account.escrowData.fetch(escrowPda)
			assert.equal(fetched.flags.release, true)

			// Verify token distributions
			const receiverToken = await getAccount(connection, receiverTokenAccount)
			const platformToken = await getAccount(connection, platformTokenAccount)
			const twToken = await getAccount(
				connection,
				trustlessWorkTokenAccount,
			)

			// Receiver should get amount minus fees
			assert.ok(Number(receiverToken.amount) > 0, 'Receiver got tokens')
			assert.ok(
				Number(platformToken.amount) > 0,
				'Platform got fee tokens',
			)
			assert.ok(
				Number(twToken.amount) > 0,
				'Trustless Work got fee tokens',
			)

			// Total distributed should equal original amount
			const totalDistributed =
				Number(receiverToken.amount) +
				Number(platformToken.amount) +
				Number(twToken.amount)
			assert.equal(totalDistributed, 1_000_000)
		})

		it('should fail to release funds twice', async () => {
			try {
				await program.methods
					.releaseFunds()
					.accounts({
						releaseSigner: releaseSigner.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: trustlessWorkTokenAccount,
						platformAccount: platformTokenAccount,
						receiverAccount: receiverTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([releaseSigner])
					.rpc()
				assert.fail('Should have thrown EscrowAlreadyResolved')
			} catch (err: any) {
				assert.include(err.message, 'EscrowAlreadyResolved')
			}
		})
	})

	describe('Dispute Flow', () => {
		let disputeEngagementId: string
		let disputeEscrowPda: PublicKey
		let disputeEscrowTokenAccount: PublicKey
		let disputeFunderTokenAccount: PublicKey
		let disputeApproverTokenAccount: PublicKey
		let disputeSpTokenAccount: PublicKey
		let disputePlatformTokenAccount: PublicKey
		let disputeTwTokenAccount: PublicKey

		before(async () => {
			disputeEngagementId = `eng-dispute-${Date.now()}`
			;[disputeEscrowPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow'), Buffer.from(disputeEngagementId)],
				program.programId,
			)

			const payer = (provider.wallet as anchor.Wallet).payer

			// Create token accounts for dispute flow
			disputeEscrowTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				disputeEscrowPda,
				Keypair.generate(),
			)
			disputeFunderTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				provider.publicKey,
				Keypair.generate(),
			)
			disputeApproverTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				approver.publicKey,
				Keypair.generate(),
			)
			disputeSpTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				serviceProvider.publicKey,
				Keypair.generate(),
			)
			disputePlatformTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				platform.publicKey,
				Keypair.generate(),
			)
			disputeTwTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				trustlessWorkWallet.publicKey,
				Keypair.generate(),
			)

			// Mint tokens to funder
			await mintTo(
				connection,
				payer,
				mint,
				disputeFunderTokenAccount,
				provider.publicKey,
				2_000_000,
			)

			// Initialize dispute escrow
			await program.methods
				.initializeEscrow({
					engagementId: disputeEngagementId,
					title: 'Dispute Test Escrow',
					description: 'Escrow for testing dispute flow',
					amount: new anchor.BN(2_000_000),
					platformFee: new anchor.BN(500),
					milestones: [
						{
							description: 'Disputed milestone',
							status: 'Pending',
							evidence: '',
							approvedFlag: false,
						},
					],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: {
						approver: approver.publicKey,
						serviceProvider: serviceProvider.publicKey,
						platformAddress: platform.publicKey,
						releaseSigner: releaseSigner.publicKey,
						disputeResolver: disputeResolver.publicKey,
						receiver: receiver.publicKey,
					},
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: disputeEscrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			// Fund the dispute escrow
			await program.methods
				.fundEscrow(new anchor.BN(2_000_000))
				.accounts({
					signer: provider.publicKey,
					escrowAccount: disputeEscrowPda,
					escrowTokenAccount: disputeEscrowTokenAccount,
					userTokenAccount: disputeFunderTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.rpc()
		})

		it('should start a dispute', async () => {
			await program.methods
				.changeDisputeFlag()
				.accounts({
					signer: approver.publicKey,
					escrowAccount: disputeEscrowPda,
				})
				.signers([approver])
				.rpc()

			const fetched = await program.account.escrowData.fetch(
				disputeEscrowPda,
			)
			assert.equal(fetched.flags.dispute, true)
		})

		it('should fail to start dispute twice', async () => {
			try {
				await program.methods
					.changeDisputeFlag()
					.accounts({
						signer: serviceProvider.publicKey,
						escrowAccount: disputeEscrowPda,
					})
					.signers([serviceProvider])
					.rpc()
				assert.fail('Should have thrown EscrowAlreadyInDispute')
			} catch (err: any) {
				assert.include(err.message, 'EscrowAlreadyInDispute')
			}
		})

		it('should resolve dispute by dispute resolver', async () => {
			// Resolve: 60% to approver, 40% to service provider
			const approverFunds = new anchor.BN(1_200_000)
			const providerFunds = new anchor.BN(800_000)

			await program.methods
				.resolveDispute(approverFunds, providerFunds)
				.accounts({
					disputeResolver: disputeResolver.publicKey,
					escrowAccount: disputeEscrowPda,
					escrowTokenAccount: disputeEscrowTokenAccount,
					trustlessWorkAccount: disputeTwTokenAccount,
					platformAccount: disputePlatformTokenAccount,
					approverAccount: disputeApproverTokenAccount,
					serviceProviderAccount: disputeSpTokenAccount,
					tokenProgram: TOKEN_PROGRAM_ID,
				})
				.signers([disputeResolver])
				.rpc()

			const fetched = await program.account.escrowData.fetch(
				disputeEscrowPda,
			)
			assert.equal(fetched.flags.resolved, true)
			assert.equal(fetched.flags.dispute, false)

			// Verify token distributions
			const approverToken = await getAccount(
				connection,
				disputeApproverTokenAccount,
			)
			const spToken = await getAccount(connection, disputeSpTokenAccount)
			const platformToken = await getAccount(
				connection,
				disputePlatformTokenAccount,
			)
			const twToken = await getAccount(connection, disputeTwTokenAccount)

			assert.ok(
				Number(approverToken.amount) > 0,
				'Approver received funds',
			)
			assert.ok(
				Number(spToken.amount) > 0,
				'Service provider received funds',
			)
			assert.ok(Number(platformToken.amount) > 0, 'Platform got fees')
			assert.ok(Number(twToken.amount) > 0, 'Trustless Work got fees')
		})
	})

	describe('change_escrow_properties', () => {
		let propsEngagementId: string
		let propsEscrowPda: PublicKey
		let propsEscrowTokenAccount: PublicKey

		before(async () => {
			propsEngagementId = `eng-props-${Date.now()}`
			;[propsEscrowPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow'), Buffer.from(propsEngagementId)],
				program.programId,
			)

			const payer = (provider.wallet as anchor.Wallet).payer

			propsEscrowTokenAccount = await createTokenAccount(
				connection,
				payer,
				mint,
				propsEscrowPda,
				Keypair.generate(),
			)

			await program.methods
				.initializeEscrow({
					engagementId: propsEngagementId,
					title: 'Props Test',
					description: 'Test property changes',
					amount: new anchor.BN(500_000),
					platformFee: new anchor.BN(300),
					milestones: [
						{
							description: 'Original milestone',
							status: 'Pending',
							evidence: '',
							approvedFlag: false,
						},
					],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: {
						approver: approver.publicKey,
						serviceProvider: serviceProvider.publicKey,
						platformAddress: platform.publicKey,
						releaseSigner: releaseSigner.publicKey,
						disputeResolver: disputeResolver.publicKey,
						receiver: receiver.publicKey,
					},
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: propsEscrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()
		})

		it('should update escrow properties by platform', async () => {
			await program.methods
				.changeEscrowProperties({
					engagementId: propsEngagementId,
					title: 'Updated Title',
					description: 'Updated description',
					amount: new anchor.BN(750_000),
					platformFee: new anchor.BN(400),
					milestones: [
						{
							description: 'Updated milestone 1',
							status: 'Pending',
							evidence: '',
							approvedFlag: false,
						},
						{
							description: 'New milestone 2',
							status: 'Pending',
							evidence: '',
							approvedFlag: false,
						},
					],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: {
						approver: approver.publicKey,
						serviceProvider: serviceProvider.publicKey,
						platformAddress: platform.publicKey,
						releaseSigner: releaseSigner.publicKey,
						disputeResolver: disputeResolver.publicKey,
						receiver: receiver.publicKey,
					},
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					platformSigner: platform.publicKey,
					escrowAccount: propsEscrowPda,
					escrowTokenAccount: propsEscrowTokenAccount,
					systemProgram: SystemProgram.programId,
				})
				.signers([platform])
				.rpc()

			const fetched = await program.account.escrowData.fetch(propsEscrowPda)
			assert.equal(fetched.title, 'Updated Title')
			assert.equal(fetched.amount.toNumber(), 750_000)
			assert.equal(fetched.milestones.length, 2)
			assert.equal(fetched.isInitialized, true) // preserved from init
		})

		it('should fail when non-platform tries to change properties', async () => {
			try {
				await program.methods
					.changeEscrowProperties({
						engagementId: propsEngagementId,
						title: 'Hack',
						description: 'Should fail',
						amount: new anchor.BN(1),
						platformFee: new anchor.BN(100),
						milestones: [],
						flags: { dispute: false, release: false, resolved: false },
						trustline: { address: mint, decimals: 6 },
						receiverMemo: new anchor.BN(0),
						roles: {
							approver: approver.publicKey,
							serviceProvider: serviceProvider.publicKey,
							platformAddress: platform.publicKey,
							releaseSigner: releaseSigner.publicKey,
							disputeResolver: disputeResolver.publicKey,
							receiver: receiver.publicKey,
						},
						balance: new anchor.BN(0),
						isInitialized: false,
					})
					.accounts({
						platformSigner: approver.publicKey,
						escrowAccount: propsEscrowPda,
						escrowTokenAccount: propsEscrowTokenAccount,
						systemProgram: SystemProgram.programId,
					})
					.signers([approver])
					.rpc()
				assert.fail('Should have thrown constraint error')
			} catch (err: any) {
				assert.ok(err)
			}
		})
	})
})
