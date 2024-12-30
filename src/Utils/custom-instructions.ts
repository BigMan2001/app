import * as anchor from "@project-serum/anchor";
import {
  type Program,
} from "@coral-xyz/anchor-30";
import {
  PublicKey,
  Keypair,
  TransactionInstruction,
  SystemProgram,
  AddressLookupTableProgram
} from "@solana/web3.js";
import { Gateway, Oracle, Randomness, SLOT_HASHES_SYSVAR_ID } from "@switchboard-xyz/on-demand";
import { SessionWalletInterface } from "@magicblock-labs/gum-react-sdk";
import bs58 from "bs58";



export async function createRandomness(
    program: Program,
    kp: Keypair,
    queue: PublicKey,
    sessionWallet: SessionWalletInterface // The one you want to be authority & payer
  ): Promise<[Randomness, TransactionInstruction]> {
    // 1. Derive LUT signer
    const [lutSigner] = await PublicKey.findProgramAddress(
      [Buffer.from("LutSigner"), kp.publicKey.toBuffer()],
      program.programId
    );
		
    // 2. Get a recent slot to create the lookup table
    const recentSlot = await program.provider.connection.getSlot("finalized");
    const [_, lut] = AddressLookupTableProgram.createLookupTable({
      authority: lutSigner,
      payer: sessionWallet.publicKey!,
      recentSlot,
    });
  
    // 3. Construct your instruction
    const ix = program.instruction.randomnessInit(
      {
        recentSlot: new anchor.BN(recentSlot),
      },
      {
        accounts: {
          randomness: kp.publicKey,
          queue,
          authority: sessionWallet.publicKey!, // custom authority
          payer: sessionWallet.publicKey!,     // custom payer
          rewardEscrow: getAssociatedTokenAddressSync(
            NATIVE_MINT,
            kp.publicKey
          ),
          systemProgram: SystemProgram.programId,
          tokenProgram: TOKEN_PROGRAM_ID,
          associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
          wrappedSolMint: NATIVE_MINT,
          programState: keyFromSeed(program),
          lutSigner,
          lut,
          addressLookupTableProgram: AddressLookupTableProgram.programId,
        },
      }
    );
    return [new Randomness(program, kp.publicKey), ix];
  }
  
export async function revealRandomnessIx(
  randomness: Randomness,
  sessionWallet: SessionWalletInterface,
): Promise<TransactionInstruction> {
  // Load Oracle
  const data = await randomness.loadData();
  const oracleKey = data.oracle;
  const oracle = new Oracle(randomness.program, oracleKey);
  const oracleData = await oracle.loadData();

  // Compute Gateway URL
  const gatewayUrl = String.fromCharCode(...oracleData.gatewayUri).replace(/\0+$/, "");
  const gateway = new Gateway(randomness.program, gatewayUrl);

  // Fetch data needed for reveal
  const gatewayRevealResponse = await gateway.fetchRandomnessReveal({
    randomnessAccount: randomness.pubkey,
    slothash: bs58.encode(data.seedSlothash),
    slot: data.seedSlot.toNumber(),
  });

  // Derive PDA for OracleRandomnessStats
  const stats = PublicKey.findProgramAddressSync(
    [Buffer.from("OracleRandomnessStats"), oracleKey.toBuffer()],
    randomness.program.programId
  )[0];

  // Prepare the TransactionInstruction
  const ix = await randomness.program.instruction.randomnessReveal(
    {
      signature: Buffer.from(gatewayRevealResponse.signature, "base64"),
      recoveryId: gatewayRevealResponse.recovery_id,
      value: gatewayRevealResponse.value,
    },
    {
      accounts: {
        randomness: randomness.pubkey,
        oracle: oracleKey,
        queue: data.queue,
        stats,
        authority: data.authority,
        payer: sessionWallet.publicKey!, 
        recentSlothashes: SLOT_HASHES_SYSVAR_ID,
        systemProgram: SystemProgram.programId,
        rewardEscrow: getAssociatedTokenAddressSync(
          NATIVE_MINT,
          randomness.pubkey
        ),
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        wrappedSolMint: NATIVE_MINT,
        programState: keyFromSeed(randomness.program),
      },
    }
  );
  console.log("ORACLE KEY", oracleKey.toString())
  console.log("QUEUE", data.queue.toString())
  return ix;
}


export function getAssociatedTokenAddressSync(
	mint: PublicKey,
	owner: PublicKey,
	allowOwnerOffCurve = false,
	programId = TOKEN_PROGRAM_ID,
	associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
): PublicKey {
	if (!allowOwnerOffCurve && !PublicKey.isOnCurve(owner.toBuffer()))
		throw new Error("TokenOwnerOffCurveError");

	const [address] = PublicKey.findProgramAddressSync(
		[owner.toBuffer(), programId.toBuffer(), mint.toBuffer()],
		associatedTokenProgramId
);
	return address;
}


export function keyFromSeed(program: Program): PublicKey {
	const [state] = PublicKey.findProgramAddressSync(
		[Buffer.from("STATE")],
		program.programId
	);
	return state;
}

export const TOKEN_PROGRAM_ID = new PublicKey(
  "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
);

/** Address of the SPL Token 2022 program */
export const TOKEN_2022_PROGRAM_ID = new PublicKey(
	"TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"
);

/** Address of the SPL Associated Token Account program */
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey(
	"ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

/** Address of the special mint for wrapped native SOL in spl-token */
export const NATIVE_MINT = new PublicKey(
	"So11111111111111111111111111111111111111112"
);

/** Address of the special mint for wrapped native SOL in spl-token-2022 */
export const NATIVE_MINT_2022 = new PublicKey(
	"9pan9bMn5HatX4EJdBwg9VgCa7Uz5HL8N1m5D3NdXejP"
);
