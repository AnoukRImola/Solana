import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { BN } from '@coral-xyz/anchor';
import { PublicKey, Transaction } from '@solana/web3.js';
import { getAssociatedTokenAddress } from '@solana/spl-token';
import { apiConfig } from 'src/config/api.config';
import {
  getConnection,
  getProgram,
  deriveEscrowPda,
  deriveMultiReleaseEscrowPda,
} from 'src/config/constants/program.constant';
import type {
  ApiResponse,
  EscrowCamelCaseResponse,
} from 'src/interfaces/response.interface';
import { PendingWriteQueueService } from '../queue/pending-write-queue.service';
import { EscrowFirestoreService } from './firestore-services/escrow-firestore.service';
import type { EscrowDto } from './Dto/escrow.dto';

@Injectable()
export class EscrowService {
  constructor(
    private pendingWriteQueue: PendingWriteQueueService,
    private readonly escrowFirestoreService: EscrowFirestoreService,
  ) {}

  // ============================
  // Single-Release Escrow
  // ============================

  async fundEscrow(
    contractId: string,
    signer: string,
    amount: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const signerPubkey = new PublicKey(signer);
      const escrowPda = new PublicKey(contractId);

      // Fetch on-chain escrow to get mint address
      const escrowData = await program.account.escrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        signerPubkey,
      );

      const ix = await program.methods
        .fundEscrow(new BN(amount))
        .accountsPartial({
          signer: signerPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          userTokenAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: signerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'SET_BALANCE',
        payload: { contractId, amount },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async releaseFunds(
    contractId: string,
    releaseSigner: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const releaseSignerPubkey = new PublicKey(releaseSigner);
      const escrowPda = new PublicKey(contractId);

      const escrowData = await program.account.escrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );

      const trustlessWorkWallet = new PublicKey(
        apiConfig.trustlessWorkFeeWallet,
      );
      const trustlessWorkAccount = await getAssociatedTokenAddress(
        mint,
        trustlessWorkWallet,
      );
      const platformAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.platformAddress,
      );
      const receiverAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.receiver,
      );

      const ix = await program.methods
        .releaseFunds()
        .accountsPartial({
          releaseSigner: releaseSignerPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          trustlessWorkAccount,
          platformAccount,
          receiverAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: releaseSignerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'MARK_RELEASED',
        payload: { contractId },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resolveDispute(
    contractId: string,
    disputeResolver: string,
    approverFunds: string,
    receiverFunds: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const disputeResolverPubkey = new PublicKey(disputeResolver);
      const escrowPda = new PublicKey(contractId);

      const escrowData = await program.account.escrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );

      const trustlessWorkWallet = new PublicKey(
        apiConfig.trustlessWorkFeeWallet,
      );
      const trustlessWorkAccount = await getAssociatedTokenAddress(
        mint,
        trustlessWorkWallet,
      );
      const platformAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.platformAddress,
      );
      const approverAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.approver,
      );
      const serviceProviderAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.serviceProvider,
      );

      const ix = await program.methods
        .resolveDispute(new BN(approverFunds), new BN(receiverFunds))
        .accountsPartial({
          disputeResolver: disputeResolverPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          trustlessWorkAccount,
          platformAccount,
          approverAccount,
          serviceProviderAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: disputeResolverPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'RESOLVE_DISPUTE',
        payload: { contractId, disputeResolver, approverFunds, receiverFunds },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeMilestoneStatus(
    contractId: string,
    milestoneIndex: string,
    newStatus: string,
    newEvidence: string,
    serviceProvider: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const serviceProviderPubkey = new PublicKey(serviceProvider);
      const escrowPda = new PublicKey(contractId);

      const ix = await program.methods
        .changeMilestoneStatus(
          Number(milestoneIndex),
          newStatus,
          newEvidence || null,
        )
        .accountsPartial({
          serviceProvider: serviceProviderPubkey,
          escrowAccount: escrowPda,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: serviceProviderPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'UPDATE_MILESTONE_STATUS',
        payload: {
          contractId,
          milestone_index: Number(milestoneIndex),
          new_status: newStatus,
          new_evidence: newEvidence || '',
        },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeMilestoneFlag(
    contractId: string,
    milestoneIndex: string,
    newFlag: boolean,
    approver: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const approverPubkey = new PublicKey(approver);
      const escrowPda = new PublicKey(contractId);

      const ix = await program.methods
        .changeMilestoneFlag(Number(milestoneIndex), newFlag)
        .accountsPartial({
          approver: approverPubkey,
          escrowAccount: escrowPda,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: approverPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'UPDATE_MILESTONE_FLAG',
        payload: {
          contractId,
          milestone_index: Number(milestoneIndex),
          new_flag: newFlag,
        },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeDisputeFlag(
    contractId: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const signerPubkey = new PublicKey(signer);
      const escrowPda = new PublicKey(contractId);

      const ix = await program.methods
        .changeDisputeFlag()
        .accountsPartial({
          signer: signerPubkey,
          escrowAccount: escrowPda,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: signerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'START_DISPUTE',
        payload: { contractId },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getEscrowByContractID(
    signer: string,
    contractId: string,
  ): Promise<EscrowCamelCaseResponse> {
    try {
      const program = getProgram();
      const escrowPda = new PublicKey(contractId);

      const escrowData = await program.account.escrowData.fetch(escrowPda);

      return {
        engagementId: escrowData.engagementId,
        title: escrowData.title,
        description: escrowData.description,
        amount: escrowData.amount.toString(),
        platformFee: escrowData.platformFee.toString(),
        milestones: escrowData.milestones.map((m) => ({
          description: m.description,
          status: m.status,
          evidence: m.evidence,
          approved_flag: m.approvedFlag,
        })),
        disputeFlag: escrowData.flags.dispute,
        releaseFlag: escrowData.flags.release,
        resolvedFlag: escrowData.flags.resolved,
        trustline: escrowData.trustline.address.toBase58(),
        trustlineDecimals: escrowData.trustline.decimals,
        receiverMemo: escrowData.receiverMemo.toString(),
        approver: escrowData.roles.approver.toBase58(),
        serviceProvider: escrowData.roles.serviceProvider.toBase58(),
        platformAddress: escrowData.roles.platformAddress.toBase58(),
        releaseSigner: escrowData.roles.releaseSigner.toBase58(),
        disputeResolver: escrowData.roles.disputeResolver.toBase58(),
        receiver: escrowData.roles.receiver.toBase58(),
        contractId,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, message: error.message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async updateEscrowByContractID(
    contractId: string,
    signer: string,
    escrow: EscrowDto,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const signerPubkey = new PublicKey(signer);
      const escrowPda = new PublicKey(contractId);

      const escrowData = await program.account.escrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );

      const newData = {
        engagementId: escrow.engagementId,
        title: escrow.title,
        description: escrow.description,
        amount: new BN(escrow.amount),
        platformFee: new BN(escrow.platformFee),
        milestones: escrow.milestones.map((m) => ({
          description: m.description,
          status: m.status || 'Pending',
          evidence: m.evidence || '',
          approvedFlag: m.approved_flag || false,
        })),
        flags: {
          dispute: escrowData.flags.dispute,
          release: escrowData.flags.release,
          resolved: escrowData.flags.resolved,
        },
        trustline: {
          address: new PublicKey(escrow.trustline),
          decimals: escrow.trustlineDecimals,
        },
        receiverMemo: new BN(escrow.receiverMemo),
        roles: {
          approver: new PublicKey(escrow.approver),
          serviceProvider: new PublicKey(escrow.serviceProvider),
          platformAddress: new PublicKey(escrow.platformAddress),
          releaseSigner: new PublicKey(escrow.releaseSigner),
          disputeResolver: new PublicKey(escrow.disputeResolver),
          receiver: new PublicKey(escrow.receiver),
        },
        balance: escrowData.balance,
        isInitialized: escrowData.isInitialized,
      };

      const ix = await program.methods
        .changeEscrowProperties(newData)
        .accountsPartial({
          platformSigner: signerPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: signerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'EDIT_ESCROW',
        payload: { contractId, signer, escrow },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to update escrow.';
      throw new HttpException(
        { status: HttpStatus.BAD_REQUEST, message },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // ============================
  // Multi-Release Escrow
  // ============================

  async fundMultiReleaseEscrow(
    contractId: string,
    signer: string,
    amount: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const signerPubkey = new PublicKey(signer);
      const escrowPda = new PublicKey(contractId);

      const escrowData =
        await program.account.multiReleaseEscrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );
      const userTokenAccount = await getAssociatedTokenAddress(
        mint,
        signerPubkey,
      );

      const ix = await program.methods
        .fundMultiReleaseEscrow(new BN(amount))
        .accountsPartial({
          signer: signerPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          userTokenAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: signerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      this.pendingWriteQueue.add(contractId, {
        type: 'SET_BALANCE',
        payload: { contractId, amount },
      });

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async changeMultiReleaseMilestoneStatus(
    contractId: string,
    milestoneIndex: string,
    newStatus: string,
    newEvidence: string,
    serviceProvider: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const serviceProviderPubkey = new PublicKey(serviceProvider);
      const escrowPda = new PublicKey(contractId);

      const ix = await program.methods
        .changeMultiReleaseMilestoneStatus(
          Number(milestoneIndex),
          newStatus,
          newEvidence || null,
        )
        .accountsPartial({
          serviceProvider: serviceProviderPubkey,
          escrowAccount: escrowPda,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: serviceProviderPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async approveMultiReleaseMilestone(
    contractId: string,
    milestoneIndex: string,
    approved: boolean,
    approver: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const approverPubkey = new PublicKey(approver);
      const escrowPda = new PublicKey(contractId);

      const ix = await program.methods
        .approveMultiReleaseMilestone(Number(milestoneIndex), approved)
        .accountsPartial({
          approver: approverPubkey,
          escrowAccount: escrowPda,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: approverPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async releaseMilestoneFunds(
    contractId: string,
    milestoneIndex: string,
    releaseSigner: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const releaseSignerPubkey = new PublicKey(releaseSigner);
      const escrowPda = new PublicKey(contractId);

      const escrowData =
        await program.account.multiReleaseEscrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;
      const milestone = escrowData.milestones[Number(milestoneIndex)];

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );
      const trustlessWorkWallet = new PublicKey(
        apiConfig.trustlessWorkFeeWallet,
      );
      const trustlessWorkAccount = await getAssociatedTokenAddress(
        mint,
        trustlessWorkWallet,
      );
      const platformAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.platformAddress,
      );
      const receiverAccount = await getAssociatedTokenAddress(
        mint,
        milestone.receiver,
      );

      const ix = await program.methods
        .releaseMilestoneFunds(Number(milestoneIndex))
        .accountsPartial({
          releaseSigner: releaseSignerPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          trustlessWorkAccount,
          platformAccount,
          receiverAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: releaseSignerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async disputeMilestone(
    contractId: string,
    milestoneIndex: string,
    signer: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const signerPubkey = new PublicKey(signer);
      const escrowPda = new PublicKey(contractId);

      const ix = await program.methods
        .disputeMilestone(Number(milestoneIndex))
        .accountsPartial({
          signer: signerPubkey,
          escrowAccount: escrowPda,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: signerPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async resolveMilestoneDispute(
    contractId: string,
    milestoneIndex: string,
    disputeResolver: string,
    approverFunds: string,
    receiverFunds: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const disputeResolverPubkey = new PublicKey(disputeResolver);
      const escrowPda = new PublicKey(contractId);

      const escrowData =
        await program.account.multiReleaseEscrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;
      const milestone = escrowData.milestones[Number(milestoneIndex)];

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );
      const trustlessWorkWallet = new PublicKey(
        apiConfig.trustlessWorkFeeWallet,
      );
      const trustlessWorkAccount = await getAssociatedTokenAddress(
        mint,
        trustlessWorkWallet,
      );
      const platformAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.platformAddress,
      );
      const approverAccount = await getAssociatedTokenAddress(
        mint,
        escrowData.roles.approver,
      );
      const receiverAccount = await getAssociatedTokenAddress(
        mint,
        milestone.receiver,
      );

      const ix = await program.methods
        .resolveMilestoneDispute(
          Number(milestoneIndex),
          new BN(approverFunds),
          new BN(receiverFunds),
        )
        .accountsPartial({
          disputeResolver: disputeResolverPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          trustlessWorkAccount,
          platformAccount,
          approverAccount,
          receiverAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: disputeResolverPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async withdrawRemainingFunds(
    contractId: string,
    approver: string,
  ): Promise<ApiResponse> {
    try {
      const program = getProgram();
      const connection = getConnection();
      const approverPubkey = new PublicKey(approver);
      const escrowPda = new PublicKey(contractId);

      const escrowData =
        await program.account.multiReleaseEscrowData.fetch(escrowPda);
      const mint = escrowData.trustline.address;

      const escrowTokenAccount = await getAssociatedTokenAddress(
        mint,
        escrowPda,
        true,
      );
      const approverTokenAccount = await getAssociatedTokenAddress(
        mint,
        approverPubkey,
      );

      const ix = await program.methods
        .withdrawRemainingFunds()
        .accountsPartial({
          approver: approverPubkey,
          escrowAccount: escrowPda,
          escrowTokenAccount,
          approverTokenAccount,
        })
        .instruction();

      const { blockhash } = await connection.getLatestBlockhash();
      const tx = new Transaction({
        recentBlockhash: blockhash,
        feePayer: approverPubkey,
      });
      tx.add(ix);

      const unsignedTx = tx
        .serialize({ requireAllSignatures: false })
        .toString('base64');

      return {
        status: 'SUCCESS',
        unsignedTransaction: unsignedTx,
      };
    } catch (error) {
      throw new HttpException(
        { status: HttpStatus.INTERNAL_SERVER_ERROR, message: error.message },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
