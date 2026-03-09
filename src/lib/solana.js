import {
  Connection,
  PublicKey,
  Transaction,
  clusterApiUrl,
} from '@solana/web3.js';
import {
  getAssociatedTokenAddress,
  createTransferCheckedInstruction,
  getAccount,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';

export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
export const USDC_DECIMALS = 6;

// Fixed protocol wallets
export const DEVELOPER_WALLET = new PublicKey('EpfmoiBoNFEofbACjZo1vpyqXUy5Fq9ZtPrGVwok5fb3');
export const BROKER_WALLET = new PublicKey('7UhwWmw1r15fqLKcbYEDVFjqiz2G753MsyDksFAjfT3e');

// Split in basis points (out of 10000)
export const CREATOR_BPS = 9000;    // 90%
export const DEVELOPER_BPS = 500;   // 5%
export const BROKER_BPS = 500;      // 5%

const connection = new Connection(
  import.meta.env.VITE_SOLANA_RPC || clusterApiUrl('mainnet-beta'),
  'confirmed'
);

export const getConnection = () => connection;

// Connect wallet — returns public key string
export const connectWallet = async () => {
  const provider = window.solana || window.phantom?.solana;
  if (!provider) {
    window.open('https://phantom.app/', '_blank');
    throw new Error('No Solana wallet found. Please install Phantom.');
  }
  const resp = await provider.connect();
  return resp.publicKey.toString();
};

// Sign a message for "sign in with Solana" — returns base58 signature
export const signAuthMessage = async (walletAddress) => {
  const provider = window.solana || window.phantom?.solana;
  if (!provider) throw new Error('Wallet not connected');
  const message = `Sign in to Bunny Ranch\nWallet: ${walletAddress}\nTimestamp: ${Date.now()}`;
  const encoded = new TextEncoder().encode(message);
  const { signature } = await provider.signMessage(encoded, 'utf8');
  return { signature, message };
};

// Get USDC balance for a wallet address
export const getUsdcBalance = async (walletAddress) => {
  try {
    const owner = new PublicKey(walletAddress);
    const tokenAccount = await getAssociatedTokenAddress(USDC_MINT, owner);
    const account = await getAccount(connection, tokenAccount);
    return Number(account.amount) / Math.pow(10, USDC_DECIMALS);
  } catch {
    return 0;
  }
};

// Pay for a post unlock in USDC
// Atomic three-way split: 90% Creator, 5% Developer, 5% Broker
export const payForContent = async (creatorWalletAddress, amountUsdc, postId) => {
  const provider = window.solana || window.phantom?.solana;
  if (!provider?.publicKey) throw new Error('Wallet not connected');

  const sender = provider.publicKey;
  const creator = new PublicKey(creatorWalletAddress);

  // Calculate each share in raw USDC units (6 decimals)
  const totalLamports = Math.round(amountUsdc * Math.pow(10, USDC_DECIMALS));
  const developerAmount = Math.round(totalLamports * DEVELOPER_BPS / 10000);
  const brokerAmount = Math.round(totalLamports * BROKER_BPS / 10000);
  const creatorAmount = totalLamports - developerAmount - brokerAmount; // creator gets the remainder to avoid rounding dust

  // Verify sender has enough balance
  const balance = await getUsdcBalance(sender.toString());
  if (balance < amountUsdc) {
    throw new Error(
      `Insufficient USDC balance. You have ${balance.toFixed(2)} USDC but need ${amountUsdc} USDC.`
    );
  }

  // Get all associated token accounts
  const senderAta = await getAssociatedTokenAddress(USDC_MINT, sender);
  const creatorAta = await getAssociatedTokenAddress(USDC_MINT, creator);
  const developerAta = await getAssociatedTokenAddress(USDC_MINT, DEVELOPER_WALLET);
  const brokerAta = await getAssociatedTokenAddress(USDC_MINT, BROKER_WALLET);

  const transaction = new Transaction();

  // Transfer 1: 90% to creator
  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      USDC_MINT,
      creatorAta,
      sender,
      BigInt(creatorAmount),
      USDC_DECIMALS,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  // Transfer 2: 5% to developer
  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      USDC_MINT,
      developerAta,
      sender,
      BigInt(developerAmount),
      USDC_DECIMALS,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  // Transfer 3: 5% to broker
  transaction.add(
    createTransferCheckedInstruction(
      senderAta,
      USDC_MINT,
      brokerAta,
      sender,
      BigInt(brokerAmount),
      USDC_DECIMALS,
      [],
      TOKEN_PROGRAM_ID
    )
  );

  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = sender;

  const signed = await provider.signAndSendTransaction(transaction);
  await connection.confirmTransaction(signed.signature, 'confirmed');

  return signed.signature;
};

// Subscribe to a creator — same payment flow, tagged as subscription
export const subscribeToCreator = async (creatorWalletAddress, amountUsdc) => {
  return payForContent(creatorWalletAddress, amountUsdc, `sub_${creatorWalletAddress}_${Date.now()}`);
};

// Returns the exact USDC amounts each party receives for a given total
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

// Truncate wallet address for display: 7xKq...mNpR
export const truncateWallet = (address, chars = 4) => {
  if (!address) return '';
  return `${address.slice(0, chars)}...${address.slice(-chars)}`;
};
