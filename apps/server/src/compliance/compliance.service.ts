import { HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common'
import { BN } from '@coral-xyz/anchor'
import { PublicKey, Transaction, sendAndConfirmTransaction } from '@solana/web3.js'
import {
	getConnection,
	getProgram,
	getServerKeypair,
	deriveComplianceRegistryPda,
	deriveKycPda,
	deriveEscrowCompliancePda,
} from 'src/config/constants/program.constant'
import type { ApiResponse } from 'src/interfaces/response.interface'
import type {
	InitializeComplianceRegistryDto,
	VerifyAddressDto,
	RevokeVerificationDto,
	SetEscrowComplianceDto,
	SetTravelRuleDataDto,
} from './dto/compliance.dto'

@Injectable()
export class ComplianceService {
	private readonly logger = new Logger(ComplianceService.name)

	async initializeComplianceRegistry(
		dto: InitializeComplianceRegistryDto,
	): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const serverKeypair = getServerKeypair()
			const [registryPda] = deriveComplianceRegistryPda()

			const ix = await program.methods
				.initializeComplianceRegistry(new BN(dto.travelRuleThreshold))
				.accountsPartial({
					registry: registryPda,
					authority: serverKeypair.publicKey,
				})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new Transaction({
				recentBlockhash: blockhash,
				feePayer: serverKeypair.publicKey,
			})
			tx.add(ix)

			const txHash = await sendAndConfirmTransaction(connection, tx, [serverKeypair])

			return {
				status: 'SUCCESS',
				txHash,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async verifyAddress(dto: VerifyAddressDto): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const serverKeypair = getServerKeypair()
			const addressPubkey = new PublicKey(dto.address)
			const [registryPda] = deriveComplianceRegistryPda()
			const [verificationPda] = deriveKycPda(addressPubkey)

			// Auto-initialize registry if it doesn't exist yet
			const existingRegistry = await this.getComplianceRegistry()
			if (!existingRegistry) {
				this.logger.log('Compliance registry not found, initializing...')
				await this.initializeComplianceRegistry({ travelRuleThreshold: '1000000' })
			}

			const ix = await program.methods
				.verifyAddress(dto.kycProvider, dto.jurisdiction, dto.riskScore)
				.accountsPartial({
					authority: serverKeypair.publicKey,
					registry: registryPda,
					verification: verificationPda,
					address: addressPubkey,
				})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new Transaction({
				recentBlockhash: blockhash,
				feePayer: serverKeypair.publicKey,
			})
			tx.add(ix)

			const txHash = await sendAndConfirmTransaction(connection, tx, [serverKeypair])

			return {
				status: 'SUCCESS',
				txHash,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async revokeVerification(dto: RevokeVerificationDto): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const signerPubkey = new PublicKey(dto.signer)
			const addressPubkey = new PublicKey(dto.address)
			const [registryPda] = deriveComplianceRegistryPda()
			const [verificationPda] = deriveKycPda(addressPubkey)

			const ix = await program.methods
				.revokeVerification()
				.accountsPartial({
					authority: signerPubkey,
					registry: registryPda,
					verification: verificationPda,
				})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new Transaction({
				recentBlockhash: blockhash,
				feePayer: signerPubkey,
			})
			tx.add(ix)

			const unsignedTx = tx
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS',
				unsignedTransaction: unsignedTx,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async setEscrowCompliance(
		dto: SetEscrowComplianceDto,
	): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const signerPubkey = new PublicKey(dto.signer)
			const escrowAddressPubkey = new PublicKey(dto.escrowAddress)
			const [registryPda] = deriveComplianceRegistryPda()
			const [compliancePda] = deriveEscrowCompliancePda(escrowAddressPubkey)

			const ix = await program.methods
				.setEscrowCompliance(dto.requiresKyc)
				.accountsPartial({
					authority: signerPubkey,
					registry: registryPda,
					compliance: compliancePda,
					escrowAddress: escrowAddressPubkey,
					})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new Transaction({
				recentBlockhash: blockhash,
				feePayer: signerPubkey,
			})
			tx.add(ix)

			const unsignedTx = tx
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS',
				unsignedTransaction: unsignedTx,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async setTravelRuleData(dto: SetTravelRuleDataDto): Promise<ApiResponse> {
		try {
			const program = getProgram()
			const connection = getConnection()
			const signerPubkey = new PublicKey(dto.signer)
			const escrowAddressPubkey = new PublicKey(dto.escrowAddress)
			const [registryPda] = deriveComplianceRegistryPda()
			const [compliancePda] = deriveEscrowCompliancePda(escrowAddressPubkey)

			const travelRule = {
				originatorName: dto.travelRuleData.originatorName,
				originatorAccount: dto.travelRuleData.originatorAccount,
				originatorJurisdiction: dto.travelRuleData.originatorJurisdiction,
				beneficiaryName: dto.travelRuleData.beneficiaryName,
				beneficiaryAccount: dto.travelRuleData.beneficiaryAccount,
				beneficiaryJurisdiction: dto.travelRuleData.beneficiaryJurisdiction,
				transferPurpose: dto.travelRuleData.transferPurpose,
			}

			const ix = await program.methods
				.setTravelRuleData(travelRule)
				.accountsPartial({
					authority: signerPubkey,
					registry: registryPda,
					compliance: compliancePda,
				})
				.instruction()

			const { blockhash } = await connection.getLatestBlockhash()
			const tx = new Transaction({
				recentBlockhash: blockhash,
				feePayer: signerPubkey,
			})
			tx.add(ix)

			const unsignedTx = tx
				.serialize({ requireAllSignatures: false })
				.toString('base64')

			return {
				status: 'SUCCESS',
				unsignedTransaction: unsignedTx,
			}
		} catch (error) {
			throw new HttpException(
				{ status: HttpStatus.BAD_REQUEST, message: error.message },
				HttpStatus.BAD_REQUEST,
			)
		}
	}

	async getAddressVerification(address: string) {
		try {
			const program = getProgram()
			const addressPubkey = new PublicKey(address)
			const [verificationPda] = deriveKycPda(addressPubkey)

			const verification =
				await program.account.addressVerification.fetch(verificationPda)

			return {
				address: verification.address.toBase58(),
				kycVerified: verification.kycVerified,
				kycProvider: verification.kycProvider,
				kycTimestamp: verification.kycTimestamp.toString(),
				riskScore: verification.riskScore,
				jurisdiction: verification.jurisdiction,
			}
		} catch {
			return null
		}
	}

	async getEscrowCompliance(escrowAddress: string) {
		try {
			const program = getProgram()
			const escrowPubkey = new PublicKey(escrowAddress)
			const [compliancePda] = deriveEscrowCompliancePda(escrowPubkey)

			const compliance =
				await program.account.escrowCompliance.fetch(compliancePda)

			return {
				escrowAddress: compliance.escrowAddress.toBase58(),
				requiresKyc: compliance.requiresKyc,
				travelRule: compliance.travelRule
					? {
							originatorName: compliance.travelRule.originatorName,
							originatorAccount: compliance.travelRule.originatorAccount,
							originatorJurisdiction:
								compliance.travelRule.originatorJurisdiction,
							beneficiaryName: compliance.travelRule.beneficiaryName,
							beneficiaryAccount: compliance.travelRule.beneficiaryAccount,
							beneficiaryJurisdiction:
								compliance.travelRule.beneficiaryJurisdiction,
							transferPurpose: compliance.travelRule.transferPurpose,
						}
					: null,
			}
		} catch {
			return null
		}
	}

	async isAddressVerified(address: string): Promise<boolean> {
		const verification = await this.getAddressVerification(address)
		return verification?.kycVerified ?? false
	}

	async getComplianceRegistry() {
		try {
			const program = getProgram()
			const [registryPda] = deriveComplianceRegistryPda()

			const registry =
				await program.account.complianceRegistry.fetch(registryPda)

			return {
				authority: registry.authority.toBase58(),
				travelRuleThreshold: registry.travelRuleThreshold.toString(),
				isInitialized: registry.isInitialized,
			}
		} catch {
			return null
		}
	}
}
