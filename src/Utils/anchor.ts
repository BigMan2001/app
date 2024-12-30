import { Program, IdlAccounts, AnchorProvider } from "@coral-xyz/anchor";
import * as anchor from "@coral-xyz/anchor";
import IDL from "../idl/twenty_one.json";
import { TwentyOne } from "@/idl/twenty_one";
import * as sb from "@switchboard-xyz/on-demand";
// import { getDefaultQueue } from "@switchboard-xyz/on-demand";
import { Cluster,  Commitment, ComputeBudgetProgram, PublicKey } from "@solana/web3.js"
import { WrappedConnection } from "./wrappedConnection";
import {
  AnchorWallet,
  useConnection,
  useWallet,
} from "@solana/wallet-adapter-react";


export const COMMITMENT: Commitment = "processed";
export const txOpts = {
  commitment: COMMITMENT as Commitment, // Use 'processed' for faster confirmation
  skipPreflight: true,                   // Skip preflight simulation
  maxRetries: 1,                         // Minimal retries to speed up
  preflightCommitment: COMMITMENT as Commitment, // Ensure preflight uses the same commitment
};


export const computeBudgetIx = ComputeBudgetProgram.setComputeUnitPrice({
  microLamports: 75_000, // Set the compute unit price
});

export  const computeLimitIx = ComputeBudgetProgram.setComputeUnitLimit({
  units: Math.ceil(200_000 * 1.3), // Set the compute unit limit multiple
});



export const CONNECTION = new WrappedConnection(
  process.env.NEXT_PUBLIC_RPC
    ? process.env.NEXT_PUBLIC_RPC
    : "https://rpc.magicblock.app/devnet",
  {
    wsEndpoint: process.env.NEXT_PUBLIC_WSS_RPC
      ? process.env.NEXT_PUBLIC_WSS_RPC
      : "wss://rpc.magicblock.app/devnet",
    commitment: "confirmed",
  }
);

// TwentyOne game program ID
export const TWENTY_ONE_PROGRAM_ID = new PublicKey(IDL.address);

export function getTwentyOneProgram(provider: AnchorProvider) {
  return new Program(IDL as TwentyOne, provider);
}


export function useAnchorProvider() {
  const { connection } = useConnection();
  const wallet = useWallet();

  return new AnchorProvider(connection, wallet as AnchorWallet, {
    commitment: "confirmed",
  });
}

export async function loadSbProgram(
  provider: anchor.Provider
): Promise<anchor.Program> {
  const sbProgramId = await sb.getProgramId(provider.connection);
  const sbIdl = await anchor.Program.fetchIdl(sbProgramId, provider);
  const sbProgram = new anchor.Program(sbIdl!, provider);
  return sbProgram;
}

export async function setupQueue(program: anchor.Program): Promise<PublicKey> {
  const queueAccount = await sb.getDefaultQueue(
    program.provider.connection.rpcEndpoint
  );

  try {
    await queueAccount.loadData();
  } catch (err) {
    console.error("Queue not found, ensure you are using devnet in your env");
    process.exit(1);
  }
  return queueAccount.pubkey;
}

export function getTwentyOneProgramId(cluster: Cluster) {
  switch (cluster) {
    case "devnet":
      return TWENTY_ONE_PROGRAM_ID;
    case "testnet":
    case "mainnet-beta":
    default:
      throw new Error(`Unsupported cluster: ${cluster}`);
  }
}


export async function loadProgram(
  provider: anchor.Provider,
  sbProgramId: PublicKey
): Promise<anchor.Program> {
  const sbIdl = await anchor.Program.fetchIdl(sbProgramId, provider);
  if (!sbIdl) {
    throw new Error("Failed to fetch IDL for the Switchboard program.");
  }
  return new anchor.Program(sbIdl, provider);
}



export const METAPLEX_READAPI = "https://devnet.helius-rpc.com/?api-key=78065db3-87fb-431c-8d43-fcd190212125";

// Seeds for PDA
export const PLAYER_SEED = "player";
export const SESSION_SEED = "session";
export const BANK_SEED = "bank";

// PDA
export const [bankPDA] = PublicKey.findProgramAddressSync(
  [Buffer.from(BANK_SEED)],
  TWENTY_ONE_PROGRAM_ID
)

export function derivePDA(
  seed: string,
  programId: PublicKey,
  publicKey?: PublicKey
): PublicKey {
  const seeds = [Buffer.from(seed)];
  if (publicKey) {
    seeds.push(Buffer.from(publicKey.toBuffer())); // Ensure compatibility
  }

  const [pda] = PublicKey.findProgramAddressSync(seeds, programId);
  return pda;
}

// Player Data Account Type from Idl
export type PlayerData = IdlAccounts<TwentyOne>["playerData"]
export type SessionData = IdlAccounts<TwentyOne>["sessionData"]
export type BankData = IdlAccounts<TwentyOne>["bankData"]



export function fetchSessionDetails(
  sessionState: SessionData
): [string[], string[]] {
  // Extract player and dealer hands from session state
  const playerHand = Array.from(sessionState.playerHand as Buffer);
  const dealerHand = Array.from(sessionState.dealerHand as Buffer);

  // Create a mapping of numbers to card ranks
  const cardMap: Record<number, string> = {
    11: "A",
    4: "K",
    3: "Q",
    2: "J",
  };

  // Transform the arrays using the mapping
  const transformedPlayerHand = playerHand.map((value: number) =>
    cardMap[value] || value.toString() // Ensure all values are strings
  );
  const transformedDealerHand = dealerHand.map((value: number) =>
    cardMap[value] || value.toString() // Ensure all values are strings
  );

  return [transformedPlayerHand, transformedDealerHand];
}




