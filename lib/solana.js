'use client';
import { Connection, PublicKey, Transaction, clusterApiUrl } from '@solana/web3.js';
import { getAssociatedTokenAddress, createTransferCheckedInstruction, getAccount, TOKEN_PROGRAM_ID } from '@solana/spl-token';

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const USDC_DECIMALS = 6;
export const DEVELOPER_WALLET = new PublicKey('EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3');
export const BROKER_WALLET = new PublicKey('7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e');
export const CREATOR_BPS = 9000;
export const DEVELOPER_BPS = 500;
export const BROKER_BPS = 500;

const getConnection = () => new Connection(
  process.env.NEXT_PUBLIC_SOLANA_RPC || clusterApiUrl('mainnet-beta'),
  'confirmed'
);

export const getUsdcBalance = async (walletAddress) => {
  try {
    const connection = getConnection();
    const owner = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, owner);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / Math.pow(10, USDC_DECIMALS);
  } catch { return 0; }
};

export const payForContent = async (creatorWalletAddress, amountUsdc) => {
  const provider = window.solana || window.phantom?.solana;
  if (!provider?.publicKey) throw new Error('Wallet not connected');

  const connection = getConnection();
  const sender = provider.publicKey;
  const creator = new PublicKey(creatorWalletAddress);

  const totalLamports = Math.round(amountUsdc * Math.pow(10, USDC_DECIMALS));
  const developerAmount = Math.round(totalLamports * DEVELOPER_BPS / 10000);
  const brokerAmount = Math.round(totalLamports * BROKER_BPS / 10000);
  const creatorAmount = totalLamports - developerAmount - brokerAmount;

  const balance = await getUsdcBalance(sender.toString());
  if (balance < amountUsdc) throw new Error(`Insufficient USDC. You have ${balance.toFixed(2)} USDC, need ${amountUsdc} USDC.`);

  const senderAta = await getAssociatedTokenAddress(USDC_MINT, sender);
  const creatorAta = await getAssociatedTokenAddress(USDC_MINT, creator);
  const developerAta = await getAssociatedTokenAddress(USDC_MINT, DEVELOPER_WALLET);
  const brokerAta = await getAssociatedTokenAddress(USDC_MINT, BROKER_WALLET);

  const transaction = new Transaction();
  transaction.add(createTransferCheckedInstruction(senderAta, USDC_MINT, creatorAta, sender, BigInt(creatorAmount), USDC_DECIMALS, [], TOKEN_PROGRAM_ID));
  transaction.add(createTransferCheckedInstruction(senderAta, USDC_MINT, developerAta, sender, BigInt(developerAmount), USDC_DECIMALS, [], TOKEN_PROGRAM_ID));
  transaction.add(createTransferCheckedInstruction(senderAta, USDC_MINT, brokerAta, sender, BigInt(brokerAmount), USDC_DECIMALS, [], TOKEN_PROGRAM_ID));

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = sender;

  const signed = await provider.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signed.signature, 'confirmed');
  return signed.signature;
};

export const subscribeToCreator = async (creatorWalletAddress, amountUsdc) => {
  return payForContent(creatorWalletAddress, amountUsdc);
};

export const calculateSplit = (amountUsdc) => {
  const total = Math.round(amountUsdc * Math.pow(10, USDC_DECIMALS));
  const developer = Math.round(total * DEVELOPER_BPS / 10000);
  const broker = Math.round(total * BROKER_BPS / 10000);
  const creator = total - developer - broker;
  return {
    creator: creator / Math.pow(10, USDC_DECIMALS),
    developer: developer / Math.pow(10, USDC_DECIMALS),
    broker: broker / Math.pow(10, USDC_DECIMALS),
    total: amountUsdc,
  };
};

export const truncateWallet = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
