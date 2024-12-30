import * as anchor from "@coral-xyz/anchor";
import {
  Connection,
  Keypair,
  PublicKey,
  SystemProgram,
	Transaction,
} from "@solana/web3.js";
import * as sb from "@switchboard-xyz/on-demand";
import { TwentyOne } from "@/idl/twenty_one";
import { computeBudgetIx, computeLimitIx } from "./anchor";
import { SessionWalletInterface } from "@magicblock-labs/gum-react-sdk";
import { createRandomness, revealRandomnessIx } from "./custom-instructions";


export async function createInitSessionInstruction(
	myProgram: anchor.Program<TwentyOne>,
  randomnessPublicKey: PublicKey,
  walletPublicKey: PublicKey,
	sessionPDA: PublicKey,
  playerPDA: PublicKey,
  bankPDA: PublicKey,
  deposit: anchor.BN
): Promise<anchor.web3.TransactionInstruction> {
	return await myProgram.methods
    .initSession(deposit)
    .accountsStrict({
      session: sessionPDA,
      player: playerPDA,
      bank: bankPDA,
      randomnessAccountData: randomnessPublicKey,
      authority: walletPublicKey,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  }


export async function createStartRoundInstruction(
	myProgram: anchor.Program<TwentyOne>,
  sessionWallet: SessionWalletInterface,
	sessionPDA: PublicKey,
  playerPDA: PublicKey,
  bet: anchor.BN
): Promise<anchor.web3.TransactionInstruction> {
	return await myProgram.methods
    .startRound(bet)
    .accountsStrict({
      sessionToken: sessionWallet.sessionToken,
      session: sessionPDA,
      player: playerPDA,
      signer: sessionWallet.publicKey!,
      systemProgram: SystemProgram.programId,
    })
    .instruction();
  }

export async function createShuffleCardsInstruction(
	myProgram: anchor.Program<TwentyOne>,
	randomnessPublicKey: PublicKey,
  sessionWallet: SessionWalletInterface,
	sessionPDA: PublicKey,
  playerPDA: PublicKey,
): Promise<anchor.web3.TransactionInstruction> {
	return await myProgram.methods
		.shuffleCards(randomnessPublicKey)
		.accountsStrict({
      sessionToken: sessionWallet.sessionToken,
			session: sessionPDA,
      player: playerPDA,
			randomnessAccountData: randomnessPublicKey,
			signer: sessionWallet.publicKey!,
			systemProgram: SystemProgram.programId,
		})
		.instruction();
}

export async function createDrawCardsInstruction(
	myProgram: anchor.Program<TwentyOne>,
	playerPDA: PublicKey,
	sessionPDA: PublicKey,
	bankPDA: PublicKey,
	randomnessPublicKey: PublicKey,
  sessionWallet: SessionWalletInterface,
): Promise<anchor.web3.TransactionInstruction> {
	return await myProgram.methods
		.drawCards()
		.accountsStrict({
      sessionToken: sessionWallet.sessionToken,
			session: sessionPDA,
			player: playerPDA,
			bank: bankPDA,
			randomnessAccountData: randomnessPublicKey,
			signer: sessionWallet.publicKey!,
			systemProgram: SystemProgram.programId,
		})
		.instruction();
}

export async function createStandInstruction(
	myProgram: anchor.Program<TwentyOne>,
	playerPDA: PublicKey,
	sessionPDA: PublicKey,
	bankPDA: PublicKey,
	randomnessPublicKey: PublicKey,
  sessionWallet: SessionWalletInterface,
): Promise<anchor.web3.TransactionInstruction> {
	return await myProgram.methods
		.stand()
		.accountsStrict({
      sessionToken: sessionWallet.sessionToken,
			session: sessionPDA,
			player: playerPDA,
			bank: bankPDA,
			randomnessAccountData: randomnessPublicKey,
			signer: sessionWallet.publicKey!,
			systemProgram: SystemProgram.programId,
		})
		.instruction();
}

export async function closeSessionInstruction(
  myProgram: anchor.Program<TwentyOne>,
  sessionPDA: PublicKey,
  playerPDA: PublicKey,
  bankPDA: PublicKey,
  walletPublicKey: PublicKey,
): Promise<anchor.web3.TransactionInstruction> {
  return await myProgram.methods
    .closeSession()
    .accountsStrict({
      session: sessionPDA,
      player: playerPDA,
      bank: bankPDA,
      authority: walletPublicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}

export async function fundPlayerInstruction(
  myProgram: anchor.Program<TwentyOne>,
  deposit: anchor.BN,
  playerPDA: PublicKey,
  walletPublicKey: PublicKey,
): Promise<anchor.web3.TransactionInstruction> {
  return await myProgram.methods
    .fundPlayer(deposit)
    .accountsStrict({
      player: playerPDA,
      signer: walletPublicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}

export async function withdrawPlayerInstruction(
  myProgram: anchor.Program<TwentyOne>,
  amount: anchor.BN,
  playerPDA: PublicKey,
  walletPublicKey: PublicKey,
): Promise<anchor.web3.TransactionInstruction> {
  return await myProgram.methods
    .withdrawPlayer(amount)
    .accountsStrict({
      player: playerPDA,
      signer: walletPublicKey,
      systemProgram: anchor.web3.SystemProgram.programId,
    })
    .instruction();
}


export async function createRandomnessAccount(
  sbProgram: anchor.Program,
  connection: Connection,
  queue: PublicKey,
  rngKp: Keypair,
  sessionWallet: SessionWalletInterface
): Promise<string> {
   
  // Create randomness instruction
  const [randomness, createRandomnessIx] = await createRandomness(sbProgram, rngKp, queue, sessionWallet);
  console.log(sessionWallet.publicKey?.toString());

  const transaction = new Transaction().add(createRandomnessIx);

  // Set the transaction payer
  transaction.feePayer = sessionWallet.publicKey!;

  // Fetch the latest blockhash for transaction
  const { blockhash } = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhash;

  const signedTransaction = await sessionWallet.signTransaction!(transaction);
  
  // Send the signed transaction to the network
  signedTransaction.partialSign(rngKp);
  
  const txid = await connection.sendRawTransaction(signedTransaction.serialize(), { skipPreflight: false });
  console.log("Transaction ID:", txid);

  await connection.confirmTransaction(txid, "confirmed");

  console.log("Transaction Signature for randomness account creation: ", txid);

  return txid;
}


export async function initSession(
  myProgram: anchor.Program<TwentyOne>,
  randomnessPublicKey: PublicKey,
  walletPublicKey: PublicKey,
  sessionPDA: PublicKey,
  playerPDA: PublicKey,
  bankPDA: PublicKey,
  deposit: anchor.BN,
  txOpts: any,
): Promise<string> {
  console.log("INIT SESSION")
  // Create init session instruction
  const initSessionIx = await createInitSessionInstruction(
    myProgram,
    randomnessPublicKey,
    walletPublicKey,
    sessionPDA,
    playerPDA,
    bankPDA,
    deposit,
  );
  
  const transaction = new Transaction().add(initSessionIx);
  console.log("Transaction created:", transaction); // Log the transaction object
  console.log("Instructions:", transaction.instructions); // Log the instructions
  console.log("INIT SESSION1111")
  const txid = await myProgram.provider.sendAndConfirm!(transaction, [], txOpts);

  console.log("Transaction Signature for rsession account initialization: ", txid);

  return txid;
}


export async function shuffleCards(
  myProgram: anchor.Program<TwentyOne>,
  sbProgram: anchor.Program,
  randomness: sb.Randomness,
  randomnessPublicKey: PublicKey,
  queue: PublicKey,
  sessionWallet: SessionWalletInterface,
  sessionPDA: PublicKey,
  playerPDA: PublicKey,
	txOpts: any,
  sessionState?: any,
  bet?: anchor.BN
): Promise<string> {

  // Create commit the randomness Ix
  const commitIx = await randomness.commitIx(queue);

  // Create shuffle cards Ix
  const shuffleCardsIx = await createShuffleCardsInstruction(
    myProgram,
    randomnessPublicKey,
    sessionWallet,
    sessionPDA,
    playerPDA
  ); 

  const transaction = new anchor.web3.Transaction();

  if (sessionState?.state === false && bet) {
    const startRoundIx = await createStartRoundInstruction(
      myProgram,
      sessionWallet,
      sessionPDA,
      playerPDA,
      bet
    );
    transaction.add(startRoundIx);
  }

  transaction.add(computeBudgetIx, computeLimitIx, commitIx, shuffleCardsIx);

  // Use session wallet to sign and send tx
  const txids = await sessionWallet.signAndSendTransaction!(
    transaction,
    myProgram.provider.connection,
    txOpts
  );

  // Confirm the transaction
  for (const txid of txids) {
    const confirmation = await myProgram.provider.connection.confirmTransaction(txid, 'confirmed');
    if (confirmation.value.err) {
      console.error(`Transaction ${txid} failed:`, confirmation.value.err);
    } else {
      console.log(`Transaction ${txid} confirmed successfully.`);
    }
  }

  console.log("Shuffle cards transaction signature:", txids[0]);

	return txids[0];
}

export async function drawCards(
  myProgram: anchor.Program<TwentyOne>,
  randomness: sb.Randomness,
  randomnessPublicKey: PublicKey,
  sessionWallet: SessionWalletInterface,
  playerPDA: PublicKey,
  sessionPDA: PublicKey,
  bankPDA: PublicKey,
	txOpts: any,
): Promise<string> {

  // Create reveal the randomness Ix
  const revealIx = await revealRandomnessIx(randomness, sessionWallet);

  // Create draw cards Ix
  const drawCardsIx = await createDrawCardsInstruction(
    myProgram,
    playerPDA,
    sessionPDA,
    bankPDA,
    randomnessPublicKey,
    sessionWallet
  );

  // Create a transaction with the instructions
  const transaction = new anchor.web3.Transaction();
  transaction.add(computeBudgetIx, computeLimitIx, revealIx, drawCardsIx);

  // Use session wallet to sign and send tx
  const txids = await sessionWallet.signAndSendTransaction!(
    transaction,
    myProgram.provider.connection,
    txOpts
  );

    // Confirm the transaction
  for (const txid of txids) {
    const confirmation = await myProgram.provider.connection.confirmTransaction(txid, 'confirmed');
    if (confirmation.value.err) {
      console.error(`Transaction ${txid} failed:`, confirmation.value.err);
    } else {
      console.log(`Transaction ${txid} confirmed successfully.`);
    }
  }

  return txids[0];
  }

export async function stand(
  myProgram: anchor.Program<TwentyOne>,
  randomness: sb.Randomness,
  randomnessPublicKey: PublicKey,
  sessionWallet: SessionWalletInterface,
  playerPDA: PublicKey,
  sessionPDA: PublicKey,
  bankPDA: PublicKey,
  txOpts: any
): Promise<string> {

  // Create reveal the randomness instruction
  const revealIx = await revealRandomnessIx(randomness, sessionWallet);

  // Create stand instruction
  const standIx = await createStandInstruction(
    myProgram,
    playerPDA,
    sessionPDA,
    bankPDA,
    randomnessPublicKey,
    sessionWallet
  );

  // Create a transaction with the instructions
  const transaction = new anchor.web3.Transaction();
  transaction.add(computeBudgetIx, computeLimitIx, revealIx, standIx);
  
  // Use session wallet to sign and send tx
  const txids = await sessionWallet.signAndSendTransaction!(
    transaction,
    myProgram.provider.connection,
    txOpts
  );

  // Confirm the transaction
  for (const txid of txids) {
    const confirmation = await myProgram.provider.connection.confirmTransaction(txid, 'confirmed');
    if (confirmation.value.err) {
      console.error(`Transaction ${txid} failed:`, confirmation.value.err);
    } else {
      console.log(`Transaction ${txid} confirmed successfully.`);
    }
  }

  return txids[0];

}

export async function closeSession(
  myProgram: anchor.Program<TwentyOne>,
  walletPublicKey: PublicKey,
  playerPDA: PublicKey,
  sessionPDA: PublicKey,
  bankPDA: PublicKey,
  txOpts: any,
): Promise<string> {

  const closeTx = await closeSessionInstruction(
    myProgram,
    sessionPDA,
    playerPDA,
    bankPDA,
    walletPublicKey
  )

  // Create a transaction with the instructions
  const transaction = new Transaction().add(closeTx);

  const txid = await myProgram.provider.sendAndConfirm!(transaction, [], txOpts);

  console.log("Transaction Signature for closing session account: ", txid);

  return txid;
}

export async function fundPlayer(
  myProgram: anchor.Program<TwentyOne>,
  walletPublicKey: PublicKey,
  playerPDA: PublicKey,
  deposit: anchor.BN,
  txOpts: any,
): Promise<string> {

  const closeTx = await fundPlayerInstruction(
    myProgram,
    deposit,
    playerPDA,
    walletPublicKey
  )

  // Create a transaction with the instructions
  const transaction = new Transaction().add(closeTx);

  const txid = await myProgram.provider.sendAndConfirm!(transaction, [], txOpts);

  console.log("Transaction Signature for funding player account: ", txid);

  return txid;
}


export async function withdrawPlayer(
  myProgram: anchor.Program<TwentyOne>,
  walletPublicKey: PublicKey,
  playerPDA: PublicKey,
  amount: anchor.BN,
  txOpts: any,
): Promise<string> {

  const closeTx = await withdrawPlayerInstruction(
    myProgram,
    amount,
    playerPDA,
    walletPublicKey
  )

  // Create a transaction with the instructions
  const transaction = new Transaction().add(closeTx);

  const txid = await myProgram.provider.sendAndConfirm!(transaction, [], txOpts);

  console.log("Transaction Signature for withdrawing player account: ", txid);

  return txid;
}




