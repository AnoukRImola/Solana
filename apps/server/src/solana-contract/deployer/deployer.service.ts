import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
// --- SOLANA IMPORTS ---
import {
	Connection,
	Keypair,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionInstruction,
} from '@solana/web3.js'
import { ApiResponse } from 'src/interfaces/response.interface'
import { serializeEscrow } from 'src/utils/parse.utils'
import { PendingWriteQueueService } from '../queue/pending-write-queue.service'
import { InvokeDeployerContractDto } from './Dto/deployer.dto'

// Documentation utilisée :
// https://solana-labs.github.io/solana-web3.js/classes/Connection.html
// https://solanacookbook.com/references/basic-transactions.html

@Injectable()
export class DeployerService {
	private connection: Connection
	private payer: Keypair
	// TODO: rendre configurable via .env
	private readonly solanaUrl = 'https://api.devnet.solana.com'

	constructor(private pendingWriteQueue: PendingWriteQueueService) {
		this.connection = new Connection(this.solanaUrl, 'confirmed')
		// Pour l'instant, génère un Keypair aléatoire (à remplacer par un keypair réel/configurable)
		this.payer = Keypair.generate()
	}

	async invokeDeployerContract(
		escrowProperties: InvokeDeployerContractDto,
	): Promise<ApiResponse> {
		try {
			const escrowAccount = Keypair.generate()

			// Définition par defaut jalon de l'escrow
			for (const milestone of escrowProperties.milestones) {
				milestone.approved_flag = false
				milestone.status = 'pending'
				milestone.evidence = ''
				milestone.description = escrowProperties.description
			}

			const escrowData = serializeEscrow(escrowProperties)
			// ? What programId to use ? Ask team. -Andler.
			const programId = new PublicKey(escrowProperties.approver)
			const instruction = new TransactionInstruction({
				keys: [
					{ pubkey: escrowAccount.publicKey, isSigner: true, isWritable: true },
					{ pubkey: this.payer.publicKey, isSigner: true, isWritable: false },
				],
				programId,
				data: escrowData, // Données Borsh
			})

			const transaction = new Transaction().add(
				SystemProgram.createAccount({
					fromPubkey: this.payer.publicKey,
					newAccountPubkey: escrowAccount.publicKey,
					lamports:
						await this.connection.getMinimumBalanceForRentExemption(200),
					space: 200,
					programId,
				}),
				instruction,
			)

			this.pendingWriteQueue.add(escrowAccount.publicKey.toBase58(), {
				type: 'SAVE_ESCROW',
				payload: { escrowProperties },
			})

			const unsignedTx = transaction
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS' as any, // À adapter selon votre enum
				unsignedTransaction: unsignedTx,
				contract_id: escrowAccount.publicKey.toBase58(),
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}
}
