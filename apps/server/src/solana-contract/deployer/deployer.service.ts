import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
// --- SOLANA IMPORTS ---
import {
	Connection,
	Keypair,
	PublicKey,
	SystemProgram,
	Transaction,
} from '@solana/web3.js'
import { apiConfig } from 'src/config/api.config'
import { ApiResponse } from 'src/interfaces/response.interface'
import { HelperService } from 'src/solana-contract/helper/helper.service'
import { serializeEscrow } from 'src/utils/parse.utils'
import { buildInvokeContractInstruction } from 'src/utils/transaction.utils'
import { PendingWriteQueueService } from '../queue/pending-write-queue.service'
import { InvokeDeployerContractDto } from './Dto/deployer.dto'

// Documentation utilisée :
// https://solana-labs.github.io/solana-web3.js/classes/Connection.html
// https://solanacookbook.com/references/basic-transactions.html

@Injectable()
export class DeployerService {
	private solanaServer: Connection

	constructor(
		private pendingWriteQueue: PendingWriteQueueService,
		private helperService: HelperService,
	) {
		this.solanaServer = this.helperService.solanaServer
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

			const programId = new PublicKey(apiConfig.solanaProgramId)
			const payer = new PublicKey(escrowProperties.signer)
			const escrowData = serializeEscrow(escrowProperties)
			// ? What programId to use ? Ask team. -Andler.
			const instruction = buildInvokeContractInstruction({
				escrowAccount: escrowAccount.publicKey,
				data: escrowData,
				programId,
				payer,
			})
			const transaction = new Transaction().add(
				SystemProgram.createAccount({
					fromPubkey: payer,
					newAccountPubkey: escrowAccount.publicKey,
					lamports:
						await this.solanaServer.getMinimumBalanceForRentExemption(200),
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
