import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
// --- SOLANA IMPORTS ---
import {
	Connection,
	Keypair,
	PublicKey,
	SystemProgram,
	Transaction,
	TransactionInstruction,
	sendAndConfirmTransaction,
} from '@solana/web3.js'
import { ApiResponse } from 'src/interfaces/response.interface'
import { serializeEscrowBorsh } from 'src/utils/parse.utils'
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
			// 1. Générer une nouvelle adresse d'escrow (PDA ou Keypair)
			const escrowAccount = Keypair.generate()

			// 2. Sérialiser les données d'escrow avec Borsh (compatible Anchor)
			const escrowData = serializeEscrowBorsh(escrowProperties)

			// 3. Créer l'instruction d'initialisation (à adapter selon votre programme Solana)
			const programId = new PublicKey('11111111111111111111111111111111') // TODO: remplacer par le vrai programme
			const instruction = new TransactionInstruction({
				keys: [
					{ pubkey: escrowAccount.publicKey, isSigner: true, isWritable: true },
					{ pubkey: this.payer.publicKey, isSigner: true, isWritable: false },
				],
				programId,
				data: escrowData, // Données Borsh
			})

			// 4. Créer la transaction
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

			// 5. (Optionnel) Ajouter à la file d'attente pour traitement asynchrone
			this.pendingWriteQueue.add(escrowAccount.publicKey.toBase58(), {
				type: 'SAVE_ESCROW',
				payload: { escrowProperties },
			})

			// 6. Retourner la transaction sérialisée (unsigned)
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
// --- Fin de la refonte étape 1 ---
// Prochaine étape : adaptation du controller pour utiliser ce service Solana.
