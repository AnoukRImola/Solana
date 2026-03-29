import { BN } from '@coral-xyz/anchor'
import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import {
	TOKEN_PROGRAM_ID,
	createAssociatedTokenAccountInstruction,
	getAssociatedTokenAddress,
} from '@solana/spl-token'
import { PublicKey } from '@solana/web3.js'
import { apiConfig } from 'src/config/api.config'
import {
	deriveEscrowPda,
	deriveMultiReleaseEscrowPda,
	getConnection,
	getProgram,
} from 'src/config/constants/program.constant'
import type { ApiResponse } from 'src/interfaces/response.interface'
import { PendingWriteQueueService } from '../queue/pending-write-queue.service'
import type { InvokeDeployerContractDto } from './Dto/deployer.dto'
import type { InvokeMultiReleaseDeployerDto } from './Dto/deployer.dto'

@Injectable()
export class DeployerService {
	constructor(private pendingWriteQueue: PendingWriteQueueService) {}

	async invokeDeployerContract(
		escrowProperties: InvokeDeployerContractDto,
	): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const signer = new PublicKey(escrowProperties.signer)
			const mint = new PublicKey(escrowProperties.trustline)

			const [escrowPda] = deriveEscrowPda(escrowProperties.engagementId)

			// Derive the escrow token account (ATA owned by escrow PDA)
			const escrowTokenAccount = await getAssociatedTokenAddress(
				mint,
				escrowPda,
				true, // allowOwnerOffCurve for PDA
			)

			const milestones = escrowProperties.milestones.map((m) => ({
				description: m.description || escrowProperties.description,
				status: 'Pending',
				evidence: '',
				approvedFlag: false,
			}))

			const escrowData = {
				engagementId: escrowProperties.engagementId,
				title: escrowProperties.title,
				description: escrowProperties.description,
				amount: new BN(escrowProperties.amount),
				platformFee: new BN(escrowProperties.platformFee),
				milestones,
				flags: { dispute: false, release: false, resolved: false },
				trustline: {
					address: mint,
					decimals: escrowProperties.trustlineDecimals,
				},
				receiverMemo: new BN(escrowProperties.receiverMemo),
				roles: {
					approver: new PublicKey(escrowProperties.approver),
					serviceProvider: new PublicKey(escrowProperties.serviceProvider),
					platformAddress: new PublicKey(escrowProperties.platformAddress),
					releaseSigner: new PublicKey(escrowProperties.releaseSigner),
					disputeResolver: new PublicKey(escrowProperties.disputeResolver),
					receiver: new PublicKey(escrowProperties.receiver),
				},
				balance: new BN(0),
				isInitialized: false,
			}

			// Build the transaction: create ATA + initialize escrow
			const createAtaIx = createAssociatedTokenAccountInstruction(
				signer,
				escrowTokenAccount,
				escrowPda,
				mint,
			)

			const initIx = await program.methods
				.initializeEscrow(escrowData)
				.accountsPartial({
					escrowAccount: escrowPda,
					initializer: signer,
				})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new (await import('@solana/web3.js')).Transaction({
				recentBlockhash: blockhash,
				feePayer: signer,
			})
			tx.add(createAtaIx, initIx)

			const contractId = escrowPda.toBase58()

			this.pendingWriteQueue.add(contractId, {
				type: 'SAVE_ESCROW',
				payload: { escrowProperties, contractId },
			})

			const unsignedTx = tx
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS',
				unsignedTransaction: unsignedTx,
				contract_id: contractId,
				engagement_id: escrowProperties.engagementId,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async invokeMultiReleaseDeployerContract(
		escrowProperties: InvokeMultiReleaseDeployerDto,
	): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const signer = new PublicKey(escrowProperties.signer)
			const mint = new PublicKey(escrowProperties.trustline)

			const [escrowPda] = deriveMultiReleaseEscrowPda(
				escrowProperties.engagementId,
			)

			const escrowTokenAccount = await getAssociatedTokenAddress(
				mint,
				escrowPda,
				true,
			)

			const milestones = escrowProperties.milestones.map((m) => ({
				description: m.description,
				status: 'Pending',
				evidence: '',
				amount: new BN(m.amount),
				receiver: new PublicKey(m.receiver),
				flags: {
					approved: false,
					disputed: false,
					released: false,
					resolved: false,
				},
			}))

			const escrowData = {
				engagementId: escrowProperties.engagementId,
				title: escrowProperties.title,
				description: escrowProperties.description,
				platformFee: new BN(escrowProperties.platformFee),
				milestones,
				trustline: {
					address: mint,
					decimals: escrowProperties.trustlineDecimals,
				},
				roles: {
					approver: new PublicKey(escrowProperties.approver),
					serviceProvider: new PublicKey(escrowProperties.serviceProvider),
					platformAddress: new PublicKey(escrowProperties.platformAddress),
					releaseSigner: new PublicKey(escrowProperties.releaseSigner),
					disputeResolver: new PublicKey(escrowProperties.disputeResolver),
				},
				balance: new BN(0),
				isInitialized: false,
			}

			const createAtaIx = createAssociatedTokenAccountInstruction(
				signer,
				escrowTokenAccount,
				escrowPda,
				mint,
			)

			const initIx = await program.methods
				.initializeMultiReleaseEscrow(escrowData)
				.accountsPartial({
					escrowAccount: escrowPda,
					initializer: signer,
				})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new (await import('@solana/web3.js')).Transaction({
				recentBlockhash: blockhash,
				feePayer: signer,
			})
			tx.add(createAtaIx, initIx)

			const contractId = escrowPda.toBase58()

			this.pendingWriteQueue.add(contractId, {
				type: 'SAVE_ESCROW',
				payload: { escrowProperties, contractId },
			})

			const unsignedTx = tx
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS',
				unsignedTransaction: unsignedTx,
				contract_id: contractId,
				engagement_id: escrowProperties.engagementId,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}
}
