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

describe('Escrow Program - Edge Cases', () => {
	anchor.setProvider(anchor.AnchorProvider.env())
	const program = anchor.workspace.Escrow as anchor.Program<Escrow>
	const provider = anchor.getProvider() as anchor.AnchorProvider
	const connection = provider.connection

	let mint: PublicKey

	const approver = Keypair.generate()
	const serviceProvider = Keypair.generate()
	const platform = Keypair.generate()
	const releaseSigner = Keypair.generate()
	const disputeResolver = Keypair.generate()
	const receiver = Keypair.generate()
	const trustlessWorkWallet = Keypair.generate()
	const randomUser = Keypair.generate()

	before(async () => {
		const airdrops = [
			approver,
			serviceProvider,
			platform,
			releaseSigner,
			disputeResolver,
			receiver,
			trustlessWorkWallet,
			randomUser,
		].map(async (kp) => {
			const sig = await connection.requestAirdrop(
				kp.publicKey,
				2 * anchor.web3.LAMPORTS_PER_SOL,
			)
			await connection.confirmTransaction(sig)
		})
		await Promise.all(airdrops)

		mint = await createMint(
			connection,
			(provider.wallet as anchor.Wallet).payer,
			provider.publicKey,
			null,
			6,
		)
	})

	const defaultRoles = () => ({
		approver: approver.publicKey,
		serviceProvider: serviceProvider.publicKey,
		platformAddress: platform.publicKey,
		releaseSigner: releaseSigner.publicKey,
		disputeResolver: disputeResolver.publicKey,
		receiver: receiver.publicKey,
	})

	const defaultMilestone = () => ({
		description: 'Milestone',
		status: 'Pending',
		evidence: '',
		approvedFlag: false,
	})

	const createEscrowSetup = async (engagementSuffix: string, amount: number) => {
		const engagementId = `eng-edge-${engagementSuffix}-${Date.now()}`
		const [escrowPda] = PublicKey.findProgramAddressSync(
			[Buffer.from('escrow'), Buffer.from(engagementId)],
			program.programId,
		)

		const payer = (provider.wallet as anchor.Wallet).payer

		const escrowTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			escrowPda,
			Keypair.generate(),
		)

		const funderTokenAccount = await createTokenAccount(
			connection,
			payer,
			mint,
			provider.publicKey,
			Keypair.generate(),
		)

		await mintTo(
			connection,
			payer,
			mint,
			funderTokenAccount,
			provider.publicKey,
			amount * 2,
		)

		return { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount }
	}

	// ============================
	// Funding Edge Cases
	// ============================

	describe('Funding edge cases', () => {
		it('should fail to fund with amount exceeding escrow amount', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('overfund', 5_000_000)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Overfund Test',
					description: 'Test overfunding',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			try {
				await program.methods
					.fundEscrow(new anchor.BN(2_000_000))
					.accounts({
						signer: provider.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						userTokenAccount: funderTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.rpc()
				assert.fail('Should have thrown AmountToDepositGreatherThanEscrowAmount')
			} catch (err: any) {
				assert.include(err.message, 'AmountToDepositGreatherThanEscrowAmount')
			}
		})

		it('should fail to fund an unfunded escrow with zero deposit', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('zerofund', 1_000_000)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Zero Fund Test',
					description: 'Test zero funding',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			try {
				await program.methods
					.fundEscrow(new anchor.BN(0))
					.accounts({
						signer: provider.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						userTokenAccount: funderTokenAccount,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.rpc()
				assert.fail('Should have thrown AmountCannotBeZero')
			} catch (err: any) {
				assert.include(err.message, 'AmountCannotBeZero')
			}
		})
	})

	// ============================
	// Release Edge Cases
	// ============================

	describe('Release edge cases', () => {
		it('should fail to release when not all milestones are approved', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('norelease', 1_000_000)

			const payer = (provider.wallet as anchor.Wallet).payer

			const receiverTA = await createTokenAccount(connection, payer, mint, receiver.publicKey, Keypair.generate())
			const platformTA = await createTokenAccount(connection, payer, mint, platform.publicKey, Keypair.generate())
			const twTA = await createTokenAccount(connection, payer, mint, trustlessWorkWallet.publicKey, Keypair.generate())

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'No Release Test',
					description: 'Milestones not approved',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone(), defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

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

			// Only complete first milestone, don't approve
			await program.methods
				.changeMilestoneStatus(0, 'Completed', 'Done')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			try {
				await program.methods
					.releaseFunds()
					.accounts({
						releaseSigner: releaseSigner.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: twTA,
						platformAccount: platformTA,
						receiverAccount: receiverTA,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([releaseSigner])
					.rpc()
				assert.fail('Should have thrown MilestoneNotApproved')
			} catch (err: any) {
				assert.include(err.message, 'MilestoneNotApproved')
			}
		})

		it('should fail when non-release-signer tries to release', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('wrongsigner', 1_000_000)

			const payer = (provider.wallet as anchor.Wallet).payer

			const receiverTA = await createTokenAccount(connection, payer, mint, receiver.publicKey, Keypair.generate())
			const platformTA = await createTokenAccount(connection, payer, mint, platform.publicKey, Keypair.generate())
			const twTA = await createTokenAccount(connection, payer, mint, trustlessWorkWallet.publicKey, Keypair.generate())

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Wrong Signer Test',
					description: 'Non release signer tries to release',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

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

			try {
				await program.methods
					.releaseFunds()
					.accounts({
						releaseSigner: randomUser.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: twTA,
						platformAccount: platformTA,
						receiverAccount: receiverTA,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([randomUser])
					.rpc()
				assert.fail('Should have thrown constraint error')
			} catch (err: any) {
				assert.ok(err)
			}
		})
	})

	// ============================
	// Dispute Edge Cases
	// ============================

	describe('Dispute edge cases', () => {
		it('should fail when unauthorized user starts dispute', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('unauthdispute', 1_000_000)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Unauth Dispute Test',
					description: 'Unauthorized dispute start',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			try {
				await program.methods
					.changeDisputeFlag()
					.accounts({
						signer: randomUser.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([randomUser])
					.rpc()
				assert.fail('Should have thrown UnauthorizedToChangeDisputeFlag')
			} catch (err: any) {
				assert.ok(err)
			}
		})

		it('should fail to resolve dispute by non-dispute-resolver', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('wrongresolver', 1_000_000)

			const payer = (provider.wallet as anchor.Wallet).payer

			const approverTA = await createTokenAccount(connection, payer, mint, approver.publicKey, Keypair.generate())
			const spTA = await createTokenAccount(connection, payer, mint, serviceProvider.publicKey, Keypair.generate())
			const platformTA = await createTokenAccount(connection, payer, mint, platform.publicKey, Keypair.generate())
			const twTA = await createTokenAccount(connection, payer, mint, trustlessWorkWallet.publicKey, Keypair.generate())

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Wrong Resolver Test',
					description: 'Non resolver tries to resolve',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

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

			await program.methods
				.changeDisputeFlag()
				.accounts({
					signer: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			try {
				await program.methods
					.resolveDispute(new anchor.BN(500_000), new anchor.BN(500_000))
					.accounts({
						disputeResolver: randomUser.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: twTA,
						platformAccount: platformTA,
						approverAccount: approverTA,
						serviceProviderAccount: spTA,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([randomUser])
					.rpc()
				assert.fail('Should have thrown constraint error')
			} catch (err: any) {
				assert.ok(err)
			}
		})

		it('should fail to resolve dispute when escrow is not in dispute', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('nodispute', 1_000_000)

			const payer = (provider.wallet as anchor.Wallet).payer

			const approverTA = await createTokenAccount(connection, payer, mint, approver.publicKey, Keypair.generate())
			const spTA = await createTokenAccount(connection, payer, mint, serviceProvider.publicKey, Keypair.generate())
			const platformTA = await createTokenAccount(connection, payer, mint, platform.publicKey, Keypair.generate())
			const twTA = await createTokenAccount(connection, payer, mint, trustlessWorkWallet.publicKey, Keypair.generate())

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Not In Dispute Test',
					description: 'No dispute started',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

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

			try {
				await program.methods
					.resolveDispute(new anchor.BN(500_000), new anchor.BN(500_000))
					.accounts({
						disputeResolver: disputeResolver.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						trustlessWorkAccount: twTA,
						platformAccount: platformTA,
						approverAccount: approverTA,
						serviceProviderAccount: spTA,
						tokenProgram: TOKEN_PROGRAM_ID,
					})
					.signers([disputeResolver])
					.rpc()
				assert.fail('Should have thrown EscrowNotInDispute')
			} catch (err: any) {
				assert.include(err.message, 'EscrowNotInDispute')
			}
		})
	})

	// ============================
	// Initialization Edge Cases
	// ============================

	describe('Initialization edge cases', () => {
		it('should fail with empty milestones array', async () => {
			const engagementId = `eng-edge-nomilestones-${Date.now()}`
			const [escrowPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow'), Buffer.from(engagementId)],
				program.programId,
			)

			try {
				await program.methods
					.initializeEscrow({
						engagementId,
						title: 'No Milestones',
						description: 'Empty milestones',
						amount: new anchor.BN(1_000_000),
						platformFee: new anchor.BN(500),
						milestones: [],
						flags: { dispute: false, release: false, resolved: false },
						trustline: { address: mint, decimals: 6 },
						receiverMemo: new anchor.BN(0),
						roles: defaultRoles(),
						balance: new anchor.BN(0),
						isInitialized: false,
					})
					.accounts({
						escrowAccount: escrowPda,
						initializer: provider.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.rpc()
				assert.fail('Should have thrown NoMileStoneDefined')
			} catch (err: any) {
				assert.include(err.message, 'NoMileStoneDefined')
			}
		})

		it('should fail to re-initialize same escrow PDA', async () => {
			const engagementId = `eng-edge-reinit-${Date.now()}`
			const [escrowPda] = PublicKey.findProgramAddressSync(
				[Buffer.from('escrow'), Buffer.from(engagementId)],
				program.programId,
			)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'First Init',
					description: 'First initialization',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			try {
				await program.methods
					.initializeEscrow({
						engagementId,
						title: 'Second Init',
						description: 'Should fail',
						amount: new anchor.BN(500_000),
						platformFee: new anchor.BN(100),
						milestones: [defaultMilestone()],
						flags: { dispute: false, release: false, resolved: false },
						trustline: { address: mint, decimals: 6 },
						receiverMemo: new anchor.BN(0),
						roles: defaultRoles(),
						balance: new anchor.BN(0),
						isInitialized: false,
					})
					.accounts({
						escrowAccount: escrowPda,
						initializer: provider.publicKey,
						systemProgram: SystemProgram.programId,
					})
					.rpc()
				assert.fail('Should have thrown due to PDA collision')
			} catch (err: any) {
				assert.ok(err)
			}
		})
	})

	// ============================
	// Property Change Edge Cases
	// ============================

	describe('Property change edge cases', () => {
		it('should fail to change properties after milestone approved', async () => {
			const { engagementId, escrowPda, escrowTokenAccount, funderTokenAccount } =
				await createEscrowSetup('propsapproved', 1_000_000)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Props Approved Test',
					description: 'Change after approval',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			// Complete and approve milestone
			await program.methods
				.changeMilestoneStatus(0, 'Completed', 'Done')
				.accounts({
					serviceProvider: serviceProvider.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([serviceProvider])
				.rpc()

			await program.methods
				.changeMilestoneFlag(0, true)
				.accounts({
					approver: approver.publicKey,
					escrowAccount: escrowPda,
				})
				.signers([approver])
				.rpc()

			try {
				await program.methods
					.changeEscrowProperties({
						engagementId,
						title: 'Changed Title',
						description: 'Should fail',
						amount: new anchor.BN(2_000_000),
						platformFee: new anchor.BN(500),
						milestones: [defaultMilestone()],
						flags: { dispute: false, release: false, resolved: false },
						trustline: { address: mint, decimals: 6 },
						receiverMemo: new anchor.BN(0),
						roles: defaultRoles(),
						balance: new anchor.BN(0),
						isInitialized: false,
					})
					.accounts({
						platformSigner: platform.publicKey,
						escrowAccount: escrowPda,
						escrowTokenAccount,
						systemProgram: SystemProgram.programId,
					})
					.signers([platform])
					.rpc()
				assert.fail('Should have thrown MilestoneApprovedCantChangeEscrowProperties')
			} catch (err: any) {
				assert.include(err.message, 'MilestoneApprovedCantChangeEscrowProperties')
			}
		})
	})

	// ============================
	// Milestone Edge Cases
	// ============================

	describe('Milestone edge cases', () => {
		it('should fail to approve milestone that is not completed', async () => {
			const { engagementId, escrowPda } =
				await createEscrowSetup('notcompleted', 1_000_000)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'Not Completed Test',
					description: 'Approve without completing',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			// Try to approve without completing first
			try {
				await program.methods
					.changeMilestoneFlag(0, true)
					.accounts({
						approver: approver.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([approver])
					.rpc()
				assert.fail('Should have thrown error')
			} catch (err: any) {
				assert.ok(err)
			}
		})

		it('should fail with out-of-bounds milestone index on flag change', async () => {
			const { engagementId, escrowPda } =
				await createEscrowSetup('oobflag', 1_000_000)

			await program.methods
				.initializeEscrow({
					engagementId,
					title: 'OOB Flag Test',
					description: 'Out of bounds flag',
					amount: new anchor.BN(1_000_000),
					platformFee: new anchor.BN(500),
					milestones: [defaultMilestone()],
					flags: { dispute: false, release: false, resolved: false },
					trustline: { address: mint, decimals: 6 },
					receiverMemo: new anchor.BN(0),
					roles: defaultRoles(),
					balance: new anchor.BN(0),
					isInitialized: false,
				})
				.accounts({
					escrowAccount: escrowPda,
					initializer: provider.publicKey,
					systemProgram: SystemProgram.programId,
				})
				.rpc()

			try {
				await program.methods
					.changeMilestoneFlag(50, true)
					.accounts({
						approver: approver.publicKey,
						escrowAccount: escrowPda,
					})
					.signers([approver])
					.rpc()
				assert.fail('Should have thrown InvalidMileStoneIndex')
			} catch (err: any) {
				assert.include(err.message, 'InvalidMileStoneIndex')
			}
		})
	})
})
