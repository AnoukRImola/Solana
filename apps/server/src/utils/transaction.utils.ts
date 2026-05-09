import { HttpException, HttpStatus } from '@nestjs/common';
import {
  Commitment,
  Connection,
  ConnectionConfig,
  Keypair,
  Transaction,
  TransactionInstruction,
  sendAndConfirmTransaction,
} from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';

export async function buildTransaction({
  account,
  operations,
  connection,
  options = 'confirmed',
}: {
  account: PublicKey;
  operations: TransactionInstruction[];
  connection: Connection;
  options?: Commitment | ConnectionConfig;
}) {
  const recentBlockhash = await connection.getLatestBlockhash(options);

  if (!recentBlockhash) throw new Error('Failed to get recent blockhash');

  const transaction = new Transaction({
    recentBlockhash: recentBlockhash.blockhash,
    feePayer: account,
  });

  for (const instruction of operations) {
    transaction.add(instruction);
  }

  return transaction;
}

export async function signAndSendTransaction({
  transaction,
  signer,
  connection,
}: {
  transaction: Transaction;
  signer: Keypair;
  connection: Connection;
}): Promise<{ signature: string; status: string }> {
  try {
    const { blockhash } = await connection.getLatestBlockhash();
    transaction.recentBlockhash = blockhash;
    transaction.sign(signer);

    const signature = await sendAndConfirmTransaction(
      connection,
      transaction,
      [signer],
      {
        commitment: 'confirmed',
        preflightCommitment: 'confirmed',
      },
    );

    if (!signature) {
      throw new Error('Transaction signature is null or undefined');
    }

    return {
      signature,
      status: 'SUCCESS',
    };
  } catch (error) {
    throw new HttpException(
      {
        status: HttpStatus.BAD_REQUEST,
        message: `Transaction failed: ${error.message}`,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}
