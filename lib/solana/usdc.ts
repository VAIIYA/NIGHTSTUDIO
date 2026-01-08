import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createTransferInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { USDC_MINT, USDC_DECIMALS, PLATFORM_FEE_PERCENT } from "./constants";

/**
 * Get the associated token address for a wallet and USDC mint
 */
export function getUSDCAddress(wallet: PublicKey): PublicKey {
  return getAssociatedTokenAddressSync(USDC_MINT, wallet, false, TOKEN_PROGRAM_ID);
}

/**
 * Check if a wallet has a USDC token account and get balance
 */
export async function getUSDCBalance(
  connection: Connection,
  wallet: PublicKey
): Promise<{ balance: number; hasAccount: boolean }> {
  try {
    const tokenAccount = getUSDCAddress(wallet);
    const accountInfo = await getAccount(connection, tokenAccount);
    const balance = Number(accountInfo.amount) / Math.pow(10, USDC_DECIMALS);
    return { balance, hasAccount: true };
  } catch (error) {
    return { balance: 0, hasAccount: false };
  }
}

/**
 * Calculate platform fee and remaining amount
 */
export function calculateFee(amount: number): { fee: number; remaining: number } {
  const fee = (amount * PLATFORM_FEE_PERCENT) / 100;
  const remaining = amount - fee;
  return { fee, remaining };
}

/**
 * Create transfer instruction for USDC payment
 * Transfers to creator wallet, with platform fee to platform wallet
 */
export async function createUSDCTransferInstruction(
  from: PublicKey,
  to: PublicKey, // Creator wallet
  amount: number, // Amount in USDC (e.g., 1.5 for 1.5 USDC)
  platformWallet?: PublicKey // Platform wallet for fee
): Promise<TransactionInstruction[]> {
  const instructions: TransactionInstruction[] = [];

  const fromTokenAccount = getUSDCAddress(from);
  const toTokenAccount = getUSDCAddress(to);

  // Convert amount to smallest unit (lamports equivalent for tokens)
  const amountInSmallestUnit = BigInt(Math.floor(amount * Math.pow(10, USDC_DECIMALS)));

  // Calculate fee if platform wallet is provided
  if (platformWallet) {
    const { fee, remaining } = calculateFee(Number(amountInSmallestUnit) / Math.pow(10, USDC_DECIMALS));
    
    if (fee > 0) {
      const platformTokenAccount = getUSDCAddress(platformWallet);
      const feeInSmallestUnit = BigInt(Math.floor(fee * Math.pow(10, USDC_DECIMALS)));
      const remainingInSmallestUnit = BigInt(Math.floor(remaining * Math.pow(10, USDC_DECIMALS)));

      // Transfer fee to platform
      instructions.push(
        createTransferInstruction(
          fromTokenAccount,
          platformTokenAccount,
          from,
          feeInSmallestUnit,
          [],
          TOKEN_PROGRAM_ID
        )
      );

      // Transfer remaining to creator
      instructions.push(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          from,
          remainingInSmallestUnit,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    } else {
      // No fee, transfer full amount
      instructions.push(
        createTransferInstruction(
          fromTokenAccount,
          toTokenAccount,
          from,
          amountInSmallestUnit,
          [],
          TOKEN_PROGRAM_ID
        )
      );
    }
  } else {
    // No platform fee, transfer full amount
    instructions.push(
      createTransferInstruction(
        fromTokenAccount,
        toTokenAccount,
        from,
        amountInSmallestUnit,
        [],
        TOKEN_PROGRAM_ID
      )
    );
  }

  return instructions;
}

/**
 * Build and return a transaction for USDC payment
 * Caller must sign and send using wallet adapter
 */
export async function buildUSDCTransferTransaction(
  connection: Connection,
  from: PublicKey,
  to: PublicKey,
  amount: number,
  platformWallet?: PublicKey
): Promise<Transaction> {
  const instructions = await createUSDCTransferInstruction(from, to, amount, platformWallet);
  
  const transaction = new Transaction().add(...instructions);
  
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = from;
  transaction.lastValidBlockHeight = lastValidBlockHeight;

  return transaction;
}

